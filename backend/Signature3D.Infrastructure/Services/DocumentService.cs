using Docnet.Core;
using Docnet.Core.Models;
using DocumentFormat.OpenXml.Packaging;
// Alias plutôt qu'un `using DocumentFormat.OpenXml.Wordprocessing` global : ce namespace
// contient son propre type `Document`, qui entrerait en collision avec l'entité du domaine
// Signature3D.Domain.Entities.Document utilisée partout ailleurs dans ce fichier.
using OpenXmlWord = DocumentFormat.OpenXml.Wordprocessing;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Pgvector;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Documents;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des documents (PDF et Word .docx).
/// Upload → extraction texte (iText7 pour PDF, Open XML SDK pour .docx) → découpage en chunks → indexation RAG.
/// </summary>
public class DocumentService : IDocumentService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IMemoryCache _cache;
    private readonly IEmbeddingProvider _embeddingProvider;
    private readonly IOcrProvider _ocrProvider;

    private const int MaxChunkSize = 800;   // ~600 tokens
    private const int ChunkOverlap = 100;   // chevauchement pour contexte
    private const int LowTextPageCharThreshold = 30; // en dessous, une page PDF est signalée comme probablement mal extraite (encadré/image)
    private const int LowTextDocumentCharThreshold = 100; // .docx — pas de notion de page, seuil au niveau du document entier
    private const int OcrRasterDpi = 150;   // résolution de rastérisation pour l'OCR — suffisant pour du texte imprimé
    private static readonly TimeSpan BackfillDelay = TimeSpan.FromMilliseconds(1200); // marge tier gratuit Gemini

    public DocumentService(AppDbContext db, IStorageService storage, IServiceScopeFactory scopeFactory, IMemoryCache cache, IEmbeddingProvider embeddingProvider, IOcrProvider ocrProvider)
    {
        _db = db;
        _storage = storage;
        _scopeFactory = scopeFactory;
        _cache = cache;
        _embeddingProvider = embeddingProvider;
        _ocrProvider = ocrProvider;
    }

    /// <summary>Retourne tous les documents d'un projet.</summary>
    public async Task<Result<List<DocumentDto>>> GetByProjectAsync(Guid projectId)
    {
        var documents = await _db.Documents
            .Include(d => d.Chunks)
            .Where(d => d.ProjectId == projectId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        var documentIds = documents.Select(d => d.Id).ToList();

        // Job d'indexation le plus récent par document — sert de repli quand le document
        // n'a pas d'IndexingError propre (le job a échoué avant même l'extraction de texte,
        // ex. erreur de stockage) mais que rien n'est autrement visible dans le dashboard.
        var latestJobByDocument = await _db.IndexingJobs
            .Where(j => documentIds.Contains(j.DocumentId))
            .GroupBy(j => j.DocumentId)
            .Select(g => g.OrderByDescending(j => j.CreatedAt).First())
            .ToDictionaryAsync(j => j.DocumentId);

        return Result<List<DocumentDto>>.Ok(documents.Select(d => new DocumentDto
        {
            Id         = d.Id,
            Name       = d.Name,
            StorageUrl = d.StorageUrl,
            SizeBytes  = d.SizeBytes,
            IsIndexed  = d.IsIndexed,
            IndexingError = d.IndexingError ?? (
                !d.IsIndexed && latestJobByDocument.TryGetValue(d.Id, out var job) && job.Status == IndexingJobStatus.Failed
                    ? job.ErrorMessage
                    : null),
            IsInternal = d.IsInternal,
            LowTextPageNumbers = d.LowTextPageNumbers,
            OcrFailedPageNumbers = d.OcrFailedPageNumbers,
            ChunkCount = d.Chunks?.Count ?? 0,
            CreatedAt  = d.CreatedAt
        }).ToList());
    }

    /// <summary>Upload un PDF dans Supabase Storage et lance l'indexation automatique.</summary>
    public async Task<Result<DocumentDto>> UploadAsync(Guid projectId, Stream fileStream, string fileName, bool isInternal = false)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<DocumentDto>.Fail("Projet introuvable.");

        // Lire le fichier en mémoire une seule fois
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        // Upload dans Supabase Storage — nom généré côté serveur (jamais le nom original,
        // qui pourrait contenir des séparateurs de chemin ou ".." — voir Path.GetFileName).
        // Un document interne est stocké dans le bucket privé (référence, pas d'URL publique).
        var safeFileName = Path.GetFileName(fileName);
        var storageFileName = $"{Guid.NewGuid()}{Path.GetExtension(safeFileName)}";
        // Content-Type explicite selon le type de fichier — le défaut de IStorageService.UploadAsync
        // est "application/pdf", correct uniquement pour les PDF.
        var contentType = safeFileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase)
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf";
        using var uploadStream = new MemoryStream(fileBytes);
        var uploadResult = await _storage.UploadAsync(uploadStream, storageFileName, $"documents/{projectId}", isPrivate: isInternal, contentType: contentType);
        if (!uploadResult.Success)
            return Result<DocumentDto>.Fail(uploadResult.Error!);

        // Sauvegarder en base
        var document = new Document
        {
            Name                    = safeFileName,
            StorageUrl              = isInternal ? string.Empty : uploadResult.Data!,
            PrivateStorageReference = isInternal ? uploadResult.Data! : null,
            SizeBytes               = fileBytes.Length,
            IsIndexed               = false,
            IsInternal              = isInternal,
            ProjectId               = projectId
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        // Indexation uniquement si le document est destiné à la base de connaissances IA —
        // enfilée en base (IndexingJob) plutôt que lancée en Task.Run : survit à un redémarrage
        // du process, traitée par DocumentIndexingBackgroundService.
        if (!isInternal)
        {
            _db.IndexingJobs.Add(new IndexingJob { ProjectId = projectId, DocumentId = document.Id });
            await _db.SaveChangesAsync();
        }

        return Result<DocumentDto>.Ok(new DocumentDto
        {
            Id         = document.Id,
            Name       = document.Name,
            StorageUrl = document.StorageUrl,
            SizeBytes  = document.SizeBytes,
            IsIndexed  = document.IsIndexed,
            IndexingError = document.IndexingError,
            IsInternal = document.IsInternal,
            LowTextPageNumbers = document.LowTextPageNumbers,
            OcrFailedPageNumbers = document.OcrFailedPageNumbers,
            ChunkCount = 0,
            CreatedAt  = document.CreatedAt
        });
    }

    /// <summary>Supprime un document et ses chunks.</summary>
    public async Task<Result> DeleteAsync(Guid documentId)
    {
        var document = await _db.Documents
            .Include(d => d.Chunks)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document is null)
            return Result.Fail("Document introuvable.");

        var storageRef = document.IsInternal ? (document.PrivateStorageReference ?? string.Empty) : document.StorageUrl;
        await _storage.DeleteAsync(storageRef);
        _db.Documents.Remove(document);
        await _db.SaveChangesAsync();
        _cache.Remove(RagCacheKeys.ForProject(document.ProjectId));

        return Result.Ok();
    }

    /// <summary>Re-indexe un document existant depuis Supabase Storage.</summary>
    public async Task<Result> IndexAsync(Guid documentId)
    {
        // Récupérer le document dans le contexte de la requête (scope actif)
        var document = await _db.Documents.FindAsync(documentId);
        if (document is null)
            return Result.Fail("Document introuvable.");

        byte[] fileBytes;
        try
        {
            fileBytes = await FetchDocumentBytesAsync(document);
        }
        catch (Exception ex)
        {
            return Result.Fail(ex.Message);
        }

        // Indexation dans un scope dédié — même chemin que l'upload
        return await IndexWithBytesInScopeAsync(documentId, fileBytes);
    }

    /// <summary>
    /// Enfile un job de réindexation avec tentative OCR sur les pages à faible texte
    /// (LowTextPageNumbers). Enfilé plutôt que synchrone — l'appel OCR + le re-embedding
    /// complet peuvent prendre 15-30s, trop long pour bloquer une requête HTTP.
    /// </summary>
    public async Task<Result> RequestOcrReindexAsync(Guid documentId)
    {
        var document = await _db.Documents.FindAsync(documentId);
        if (document is null)
            return Result.Fail("Document introuvable.");

        _db.IndexingJobs.Add(new IndexingJob { ProjectId = document.ProjectId, DocumentId = documentId, AttemptOcr = true });
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>Télécharge les bytes d'un document depuis Supabase Storage (URL signée si interne, publique sinon).</summary>
    private async Task<byte[]> FetchDocumentBytesAsync(Document document)
    {
        string downloadUrl;
        if (document.IsInternal)
        {
            if (string.IsNullOrEmpty(document.PrivateStorageReference))
                throw new InvalidOperationException("Référence de stockage privée manquante.");

            var signedUrlResult = await _storage.GetSignedUrlAsync(document.PrivateStorageReference);
            if (!signedUrlResult.Success)
                throw new InvalidOperationException(signedUrlResult.Error!);

            downloadUrl = signedUrlResult.Data!;
        }
        else
        {
            downloadUrl = document.StorageUrl;
        }

        using var httpClient = new HttpClient();
        return await httpClient.GetByteArrayAsync(downloadUrl);
    }

    /// <summary>Bascule un document entre interne et base de connaissances IA.</summary>
    public async Task<Result> SetCategoryAsync(Guid documentId, bool isInternal)
    {
        var document = await _db.Documents
            .Include(d => d.Chunks)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document is null)
            return Result.Fail("Document introuvable.");

        if (document.IsInternal == isInternal)
            return Result.Ok(); // déjà dans le bon état

        if (isInternal)
        {
            // IA → interne : déplacer le fichier vers le bucket privé AVANT de changer l'état —
            // si le déplacement échoue, le document reste "IA" plutôt que de se prétendre
            // interne alors que son fichier est toujours public.
            var moveResult = await _storage.MoveToPrivateAsync(document.StorageUrl);
            if (!moveResult.Success)
                return Result.Fail(moveResult.Error!);

            document.PrivateStorageReference = moveResult.Data!;
            document.StorageUrl = string.Empty;
            document.IsInternal = true;

            // Supprimer les chunks, marquer non indexé
            if (document.Chunks.Any())
                _db.DocumentChunks.RemoveRange(document.Chunks);
            document.IsIndexed = false;
            document.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            _cache.Remove(RagCacheKeys.ForProject(document.ProjectId));
        }
        else
        {
            // interne → IA : déplacer le fichier vers le bucket public AVANT de changer l'état,
            // puis sauvegarder et ré-indexer dans un scope dédié.
            var moveResult = await _storage.MoveToPublicAsync(document.PrivateStorageReference!);
            if (!moveResult.Success)
                return Result.Fail(moveResult.Error!);

            document.StorageUrl = moveResult.Data!;
            document.PrivateStorageReference = null;
            document.IsInternal = false;
            document.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // Ré-indexation enfilée (voir commentaire équivalent dans UploadAsync)
            _db.IndexingJobs.Add(new IndexingJob { ProjectId = document.ProjectId, DocumentId = documentId });
            await _db.SaveChangesAsync();
        }

        return Result.Ok();
    }

    /// <summary>Génère une URL signée à durée limitée pour consulter un document interne.</summary>
    public async Task<Result<string>> GetSignedUrlAsync(Guid documentId)
    {
        var document = await _db.Documents.FindAsync(documentId);
        if (document is null)
            return Result<string>.Fail("Document introuvable.");

        if (!document.IsInternal || string.IsNullOrEmpty(document.PrivateStorageReference))
            return Result<string>.Fail("Ce document n'est pas stocké de façon privée.");

        return await _storage.GetSignedUrlAsync(document.PrivateStorageReference);
    }

    /// <summary>
    /// Rattrapage : génère l'embedding des chunks existants qui n'en ont pas encore (Embedding IS NULL).
    /// Traitement séquentiel avec délai entre chaque appel pour rester sous les limites de taux
    /// du tier gratuit Gemini. Sauvegarde au fur et à mesure — une interruption ne perd pas le travail déjà fait.
    /// </summary>
    public async Task<Result<EmbeddingBackfillResultDto>> BackfillEmbeddingsAsync()
    {
        var chunks = await _db.DocumentChunks
            .Where(c => c.Embedding == null)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        var stats = new EmbeddingBackfillResultDto();

        foreach (var chunk in chunks)
        {
            stats.Processed++;
            try
            {
                var embeddingResult = await _embeddingProvider.GenerateEmbeddingAsync(chunk.Content);
                if (embeddingResult.Success)
                {
                    chunk.Embedding = new Vector(embeddingResult.Data!);
                    stats.Succeeded++;
                }
                else
                {
                    Console.WriteLine($"[DocumentService] ⚠️ Rattrapage embedding chunk {chunk.Id} échoué : {embeddingResult.Error}");
                    stats.Failed++;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DocumentService] ⚠️ Rattrapage embedding chunk {chunk.Id} exception : {ex.Message}");
                stats.Failed++;
            }

            await _db.SaveChangesAsync();

            if (stats.Processed < chunks.Count)
                await Task.Delay(BackfillDelay);
        }

        return Result<EmbeddingBackfillResultDto>.Ok(stats);
    }

    /// <summary>Traite un job d'indexation en file d'attente — appelé par DocumentIndexingBackgroundService.</summary>
    public async Task ProcessIndexingJobAsync(Guid jobId)
    {
        var job = await _db.IndexingJobs.FindAsync(jobId);
        if (job is null) return;

        job.Status = IndexingJobStatus.Processing;
        job.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        Result result;
        try
        {
            var document = await _db.Documents.FindAsync(job.DocumentId);
            if (document is null)
                throw new InvalidOperationException("Document introuvable.");

            var fileBytes = await FetchDocumentBytesAsync(document);
            result = await IndexDocumentCoreAsync(_db, job.DocumentId, fileBytes, job.AttemptOcr);
        }
        catch (Exception ex)
        {
            result = Result.Fail(ex.Message);
        }

        job.Status = result.Success ? IndexingJobStatus.Completed : IndexingJobStatus.Failed;
        job.ErrorMessage = result.Success ? null : result.Error;
        job.ProcessedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    /* ── Extraction + indexation — toujours dans un scope dédié ── */

    private async Task<Result> IndexWithBytesInScopeAsync(Guid documentId, byte[] fileBytes)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await IndexDocumentCoreAsync(db, documentId, fileBytes);
    }

    /// <summary>
    /// Cœur de l'indexation — extraction texte, chunking, sauvegarde. Prend un AppDbContext fourni
    /// par l'appelant (qui gère son propre scope), pour être réutilisable depuis un scope de requête,
    /// un scope créé à la volée (IndexWithBytesInScopeAsync), ou le scope du BackgroundService.
    /// Le type de fichier (PDF ou .docx) est déterminé par l'extension de document.Name.
    /// Si <paramref name="attemptOcr"/> est vrai ET que le document est un PDF, les pages détectées
    /// à faible texte (LowTextPageNumbers) sont rastérisées et passées à l'OCR — leur texte est
    /// remplacé si l'OCR trouve suffisamment de contenu, sinon la page passe dans OcrFailedPageNumbers
    /// (état terminal — pas de nouvelle tentative automatique). Aucun repli OCR pour les .docx —
    /// il n'existe pas de rendu de page fiable pour ce format sans moteur de mise en page complet
    /// (limitation connue, documentée ici plutôt que contournée).
    /// </summary>
    private async Task<Result> IndexDocumentCoreAsync(AppDbContext db, Guid documentId, byte[] fileBytes, bool attemptOcr = false)
    {
        try
        {
            var document = await db.Documents
                .Include(d => d.Chunks)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document is null) return Result.Fail("Document introuvable.");

            var isDocx = document.Name.EndsWith(".docx", StringComparison.OrdinalIgnoreCase);

            // Supprimer les anciens chunks
            if (document.Chunks.Any())
                db.DocumentChunks.RemoveRange(document.Chunks);

            // Extraire le texte — iText7 par page pour un PDF (pour pouvoir substituer le texte OCR
            // d'une page précise sans perdre les frontières entre pages), Open XML SDK pour un .docx
            // (pas de notion de page, le "PageTexts" ne contient alors qu'une seule entrée : tout le document).
            var (pageTexts, lowTextPages) = isDocx ? ExtractTextFromDocx(fileBytes) : ExtractTextFromPdf(fileBytes);
            document.LowTextPageNumbers = lowTextPages;

            if (attemptOcr && !isDocx && lowTextPages.Count > 0)
            {
                var stillLowText = new List<int>(lowTextPages);
                var ocrFailedPages = new List<int>();

                foreach (var pageNumber in lowTextPages)
                {
                    string ocrText;
                    try
                    {
                        var pageImage = RasterizePdfPageToPng(fileBytes, pageNumber);
                        var ocrResult = await _ocrProvider.ExtractTextFromImageAsync(pageImage);
                        ocrText = ocrResult.Success ? ocrResult.Data! : string.Empty;
                        if (!ocrResult.Success)
                            Console.WriteLine($"[DocumentService] ⚠️ OCR page {pageNumber} échoué : {ocrResult.Error}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[DocumentService] ⚠️ OCR page {pageNumber} exception : {ex.Message}");
                        ocrText = string.Empty;
                    }

                    if (ocrText.Trim().Length >= LowTextPageCharThreshold)
                    {
                        pageTexts[pageNumber - 1] = ocrText;
                        stillLowText.Remove(pageNumber);
                        Console.WriteLine($"[DocumentService] ✅ OCR page {pageNumber} : {ocrText.Trim().Length} caractères récupérés");
                    }
                    else
                    {
                        ocrFailedPages.Add(pageNumber);
                        Console.WriteLine($"[DocumentService] ⚠️ OCR page {pageNumber} toujours sous le seuil ({ocrText.Trim().Length} caractères)");
                    }
                }

                document.LowTextPageNumbers = stillLowText;
                document.OcrFailedPageNumbers = ocrFailedPages;
            }

            var extractedText = ConcatenateAndClean(pageTexts);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                Console.WriteLine($"[DocumentService] Aucun texte extrait de {document.Name}");
                document.IsIndexed = false;
                document.IndexingError = isDocx
                    ? "Aucun texte n'a pu être extrait de ce document (probablement un contenu scanné/image collé dans le Word — l'OCR n'est pas disponible pour les .docx)."
                    : "Aucun texte n'a pu être extrait de ce document (probablement un PDF scanné/image sans OCR).";
                await db.SaveChangesAsync();
                _cache.Remove(RagCacheKeys.ForProject(document.ProjectId));
                return Result.Ok();
            }

            Console.WriteLine($"[DocumentService] Texte extrait : {extractedText.Length} caractères de {document.Name}");

            // Découper en chunks
            var chunks = ChunkText(extractedText, MaxChunkSize, ChunkOverlap);
            Console.WriteLine($"[DocumentService] {chunks.Count} chunks créés");

            // Créer les chunks — un embedding est généré par chunk (RAG sémantique), mais un échec
            // (timeout, quota Gemini dépassé) n'empêche jamais la sauvegarde du chunk : le RAG par
            // mots-clés reste le filet de sécurité si l'embedding est absent (Embedding = null).
            // Délai entre chaque appel — même marge que BackfillEmbeddingsAsync — pour rester sous
            // les limites de taux du tier gratuit Gemini sur les documents à beaucoup de chunks.
            var chunkEntities = new List<DocumentChunk>();
            for (int i = 0; i < chunks.Count; i++)
            {
                Vector? embedding = null;
                try
                {
                    var embeddingResult = await _embeddingProvider.GenerateEmbeddingAsync(chunks[i]);
                    if (embeddingResult.Success)
                        embedding = new Vector(embeddingResult.Data!);
                    else
                        Console.WriteLine($"[DocumentService] ⚠️ Embedding chunk {i} échoué : {embeddingResult.Error}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DocumentService] ⚠️ Embedding chunk {i} exception : {ex.Message}");
                }

                chunkEntities.Add(new DocumentChunk
                {
                    DocumentId = documentId,
                    Content    = chunks[i],
                    ChunkIndex = i,
                    Embedding  = embedding
                });

                if (i < chunks.Count - 1)
                    await Task.Delay(BackfillDelay);
            }

            db.DocumentChunks.AddRange(chunkEntities);
            document.IsIndexed  = true;
            document.IndexingError = null;
            document.UpdatedAt  = DateTime.UtcNow;
            await db.SaveChangesAsync();
            _cache.Remove(RagCacheKeys.ForProject(document.ProjectId));

            Console.WriteLine($"[DocumentService] ✅ {document.Name} indexé avec {chunks.Count} chunks");
            return Result.Ok();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DocumentService] ❌ Erreur indexation : {ex.Message}");
            return Result.Fail($"Erreur indexation : {ex.Message}");
        }
    }

    /// <summary>
    /// Extrait le texte d'un PDF avec iText7, page par page (plutôt qu'une seule chaîne
    /// concaténée) — nécessaire pour pouvoir substituer le texte OCR d'une page précise sans
    /// perdre les frontières entre pages. Signale au passage les pages dont le texte brut
    /// (avant nettoyage global) est anormalement court — signe probable d'un encadré/visuel
    /// exporté en image plutôt qu'en texte réel, invisible à l'extraction sans OCR.
    /// </summary>
    private static (List<string> PageTexts, List<int> LowTextPages) ExtractTextFromPdf(byte[] pdfBytes)
    {
        try
        {
            using var ms     = new MemoryStream(pdfBytes);
            using var reader = new PdfReader(ms);
            using var pdf    = new PdfDocument(reader);

            var pageTexts = new List<string>();
            var lowTextPages = new List<int>();

            for (int page = 1; page <= pdf.GetNumberOfPages(); page++)
            {
                var strategy = new SimpleTextExtractionStrategy();
                var text     = PdfTextExtractor.GetTextFromPage(pdf.GetPage(page), strategy);
                if (text.Trim().Length < LowTextPageCharThreshold)
                    lowTextPages.Add(page);
                pageTexts.Add(text);
            }

            return (pageTexts, lowTextPages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DocumentService] Erreur extraction PDF : {ex.Message}");
            return ([], []);
        }
    }

    /// <summary>
    /// Extrait le texte d'un .docx avec le SDK Open XML, en distinguant paragraphes et tableaux
    /// (plutôt qu'un simple .InnerText global) pour préserver la structure ligne/colonne des
    /// tableaux — chaque ligne de tableau devient une ligne de texte, cellules séparées par " | ".
    /// Pas de notion de page dans un .docx : le document entier forme une seule "page" logique,
    /// et le signalement "texte faible" (LowTextPages) s'applique donc au document en entier
    /// (sentinelle [1]) plutôt qu'à une page précise — voir LowTextDocumentCharThreshold.
    /// </summary>
    private static (List<string> PageTexts, List<int> LowTextPages) ExtractTextFromDocx(byte[] docxBytes)
    {
        try
        {
            using var ms = new MemoryStream(docxBytes);
            using var wordDoc = WordprocessingDocument.Open(ms, false);
            var body = wordDoc.MainDocumentPart?.Document?.Body;
            if (body is null) return ([], []);

            var sb = new System.Text.StringBuilder();
            foreach (var element in body.Elements())
            {
                switch (element)
                {
                    case OpenXmlWord.Paragraph paragraph:
                        var paragraphText = paragraph.InnerText;
                        if (!string.IsNullOrWhiteSpace(paragraphText))
                            sb.AppendLine(paragraphText);
                        break;

                    case OpenXmlWord.Table table:
                        foreach (var row in table.Elements<OpenXmlWord.TableRow>())
                        {
                            var cells = row.Elements<OpenXmlWord.TableCell>().Select(c => c.InnerText.Trim());
                            sb.AppendLine(string.Join(" | ", cells));
                        }
                        break;
                }
            }

            var text = sb.ToString();
            var lowTextPages = text.Trim().Length < LowTextDocumentCharThreshold ? new List<int> { 1 } : [];
            return ([text], lowTextPages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DocumentService] Erreur extraction DOCX : {ex.Message}");
            return ([], []);
        }
    }

    /// <summary>Concatène les textes de page et nettoie les espaces multiples (même règle qu'avant).</summary>
    private static string ConcatenateAndClean(List<string> pageTexts)
    {
        var sb = new System.Text.StringBuilder();
        foreach (var text in pageTexts)
            sb.AppendLine(text);

        var result = sb.ToString();
        result = System.Text.RegularExpressions.Regex.Replace(result, @"\s{3,}", "  ");
        return result.Trim();
    }

    /// <summary>
    /// Rastérise une page PDF (numérotée à partir de 1) en PNG pour l'envoyer à l'OCR —
    /// Docnet.Core (wrapper PDFium) rend des pixels bruts BGRA, encodés en PNG via ImageSharp.
    /// </summary>
    private static byte[] RasterizePdfPageToPng(byte[] pdfBytes, int pageNumber)
    {
        using var docReader = DocLib.Instance.GetDocReader(pdfBytes, new PageDimensions(OcrRasterDpi / 72.0));
        using var pageReader = docReader.GetPageReader(pageNumber - 1);

        var width = pageReader.GetPageWidth();
        var height = pageReader.GetPageHeight();
        var rawBytes = pageReader.GetImage();

        using var image = Image.LoadPixelData<Bgra32>(rawBytes, width, height);
        using var outputStream = new MemoryStream();
        image.SaveAsPng(outputStream);
        return outputStream.ToArray();
    }

    /// <summary>
    /// Découpe le texte en chunks avec chevauchement pour le RAG.
    /// Coupe aux fins de phrases pour préserver la cohérence.
    /// </summary>
    private static List<string> ChunkText(string text, int maxSize, int overlap)
    {
        var chunks = new List<string>();
        var sentences = text.Split(new[] { ". ", ".\n", "!\n", "?\n" }, StringSplitOptions.RemoveEmptyEntries);

        var current = new System.Text.StringBuilder();

        foreach (var sentence in sentences)
        {
            var toAdd = sentence.Trim() + ". ";

            if (current.Length + toAdd.Length > maxSize && current.Length > 0)
            {
                chunks.Add(current.ToString().Trim());

                // Garder les derniers caractères pour le chevauchement
                var overlapText = current.Length > overlap
                    ? current.ToString(current.Length - overlap, overlap)
                    : current.ToString();
                current.Clear();
                current.Append(overlapText);
            }

            current.Append(toAdd);
        }

        if (current.Length > 0)
            chunks.Add(current.ToString().Trim());

        return chunks.Where(c => c.Length > 20).ToList();
    }
}