using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Documents;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des documents PDF.
/// Upload → extraction texte (iText7) → découpage en chunks → indexation RAG.
/// </summary>
public class DocumentService : IDocumentService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IMemoryCache _cache;

    private const int MaxChunkSize = 800;   // ~600 tokens
    private const int ChunkOverlap = 100;   // chevauchement pour contexte

    public DocumentService(AppDbContext db, IStorageService storage, IServiceScopeFactory scopeFactory, IMemoryCache cache)
    {
        _db = db;
        _storage = storage;
        _scopeFactory = scopeFactory;
        _cache = cache;
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

        // Upload dans Supabase Storage — nom unique pour éviter les collisions
        // Un document interne est stocké dans le bucket privé (référence, pas d'URL publique).
        var storageFileName = $"{Guid.NewGuid()}-{fileName}";
        using var uploadStream = new MemoryStream(fileBytes);
        var uploadResult = await _storage.UploadAsync(uploadStream, storageFileName, $"documents/{projectId}", isPrivate: isInternal);
        if (!uploadResult.Success)
            return Result<DocumentDto>.Fail(uploadResult.Error!);

        // Sauvegarder en base
        var document = new Document
        {
            Name                    = fileName,
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

        byte[] pdfBytes;
        try
        {
            pdfBytes = await FetchDocumentBytesAsync(document);
        }
        catch (Exception ex)
        {
            return Result.Fail(ex.Message);
        }

        // Indexation dans un scope dédié — même chemin que l'upload
        return await IndexWithBytesInScopeAsync(documentId, pdfBytes);
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

            var pdfBytes = await FetchDocumentBytesAsync(document);
            result = await IndexDocumentCoreAsync(_db, job.DocumentId, pdfBytes);
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

    private async Task<Result> IndexWithBytesInScopeAsync(Guid documentId, byte[] pdfBytes)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await IndexDocumentCoreAsync(db, documentId, pdfBytes);
    }

    /// <summary>
    /// Cœur de l'indexation — extraction texte, chunking, sauvegarde. Prend un AppDbContext fourni
    /// par l'appelant (qui gère son propre scope), pour être réutilisable depuis un scope de requête,
    /// un scope créé à la volée (IndexWithBytesInScopeAsync), ou le scope du BackgroundService.
    /// </summary>
    private async Task<Result> IndexDocumentCoreAsync(AppDbContext db, Guid documentId, byte[] pdfBytes)
    {
        try
        {
            var document = await db.Documents
                .Include(d => d.Chunks)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document is null) return Result.Fail("Document introuvable.");

            // Supprimer les anciens chunks
            if (document.Chunks.Any())
                db.DocumentChunks.RemoveRange(document.Chunks);

            // Extraire le texte avec iText7
            var extractedText = ExtractTextFromPdf(pdfBytes);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                Console.WriteLine($"[DocumentService] Aucun texte extrait de {document.Name}");
                document.IsIndexed = false;
                document.IndexingError = "Aucun texte n'a pu être extrait de ce document (probablement un PDF scanné/image sans OCR).";
                await db.SaveChangesAsync();
                _cache.Remove(RagCacheKeys.ForProject(document.ProjectId));
                return Result.Ok();
            }

            Console.WriteLine($"[DocumentService] Texte extrait : {extractedText.Length} caractères de {document.Name}");

            // Découper en chunks
            var chunks = ChunkText(extractedText, MaxChunkSize, ChunkOverlap);
            Console.WriteLine($"[DocumentService] {chunks.Count} chunks créés");

            // Créer les chunks (sans embeddings pour l'instant — RAG basé sur texte)
            var chunkEntities = chunks.Select((content, i) => new DocumentChunk
            {
                DocumentId = documentId,
                Content    = content,
                ChunkIndex = i,
                Embedding  = null  // pgvector sera activé plus tard
            }).ToList();

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

    /// <summary>Extrait le texte d'un PDF avec iText7.</summary>
    private static string ExtractTextFromPdf(byte[] pdfBytes)
    {
        try
        {
            using var ms     = new MemoryStream(pdfBytes);
            using var reader = new PdfReader(ms);
            using var pdf    = new PdfDocument(reader);

            var sb = new System.Text.StringBuilder();

            for (int page = 1; page <= pdf.GetNumberOfPages(); page++)
            {
                var strategy = new SimpleTextExtractionStrategy();
                var text     = PdfTextExtractor.GetTextFromPage(pdf.GetPage(page), strategy);
                sb.AppendLine(text);
            }

            // Nettoyer le texte extrait
            var result = sb.ToString();
            result = System.Text.RegularExpressions.Regex.Replace(result, @"\s{3,}", "  ");
            result = result.Trim();

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DocumentService] Erreur extraction PDF : {ex.Message}");
            return string.Empty;
        }
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