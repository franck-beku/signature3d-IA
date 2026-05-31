using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Documents;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
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
    private readonly IAIProvider _aiProvider;

    private const int MaxChunkSize = 800;   // ~600 tokens
    private const int ChunkOverlap = 100;   // chevauchement pour contexte

    public DocumentService(AppDbContext db, IStorageService storage, IAIProvider aiProvider)
    {
        _db = db;
        _storage = storage;
        _aiProvider = aiProvider;
    }

    /// <summary>Retourne tous les documents d'un projet.</summary>
    public async Task<Result<List<DocumentDto>>> GetByProjectAsync(Guid projectId)
    {
        var documents = await _db.Documents
            .Include(d => d.Chunks)
            .Where(d => d.ProjectId == projectId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Result<List<DocumentDto>>.Ok(documents.Select(d => new DocumentDto
        {
            Id         = d.Id,
            Name       = d.Name,
            StorageUrl = d.StorageUrl,
            SizeBytes  = d.SizeBytes,
            IsIndexed  = d.IsIndexed,
            ChunkCount = d.Chunks?.Count ?? 0,
            CreatedAt  = d.CreatedAt
        }).ToList());
    }

    /// <summary>Upload un PDF dans Supabase Storage et lance l'indexation automatique.</summary>
    public async Task<Result<DocumentDto>> UploadAsync(Guid projectId, Stream fileStream, string fileName)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<DocumentDto>.Fail("Projet introuvable.");

        // Lire le fichier en mémoire une seule fois
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        // Upload dans Supabase Storage
        using var uploadStream = new MemoryStream(fileBytes);
        var uploadResult = await _storage.UploadAsync(uploadStream, fileName, $"documents/{projectId}");
        if (!uploadResult.Success)
            return Result<DocumentDto>.Fail(uploadResult.Error!);

        // Sauvegarder en base
        var document = new Document
        {
            Name       = fileName,
            StorageUrl = uploadResult.Data!,
            SizeBytes  = fileBytes.Length,
            IsIndexed  = false,
            ProjectId  = projectId
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        // Lancer l'indexation en arrière-plan avec les bytes déjà en mémoire
        _ = Task.Run(() => IndexWithBytesAsync(document.Id, fileBytes));

        return Result<DocumentDto>.Ok(new DocumentDto
        {
            Id         = document.Id,
            Name       = document.Name,
            StorageUrl = document.StorageUrl,
            SizeBytes  = document.SizeBytes,
            IsIndexed  = document.IsIndexed,
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

        await _storage.DeleteAsync(document.StorageUrl);
        _db.Documents.Remove(document);
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>Re-indexe un document existant depuis Supabase Storage.</summary>
    public async Task<Result> IndexAsync(Guid documentId)
    {
        var document = await _db.Documents
            .Include(d => d.Chunks)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document is null)
            return Result.Fail("Document introuvable.");

        // Télécharger le PDF depuis Supabase Storage
        using var httpClient = new HttpClient();
        var pdfBytes = await httpClient.GetByteArrayAsync(document.StorageUrl);

        return await IndexWithBytesAsync(documentId, pdfBytes);
    }

    /* ── Extraction + indexation interne ── */

    private async Task<Result> IndexWithBytesAsync(Guid documentId, byte[] pdfBytes)
    {
        try
        {
            // Recharger le document dans un nouveau contexte
            var document = await _db.Documents
                .Include(d => d.Chunks)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document is null) return Result.Fail("Document introuvable.");

            // Supprimer les anciens chunks
            if (document.Chunks.Any())
                _db.DocumentChunks.RemoveRange(document.Chunks);

            // Extraire le texte avec iText7
            var extractedText = ExtractTextFromPdf(pdfBytes);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                Console.WriteLine($"[DocumentService] Aucun texte extrait de {document.Name}");
                document.IsIndexed = true;
                await _db.SaveChangesAsync();
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

            _db.DocumentChunks.AddRange(chunkEntities);
            document.IsIndexed  = true;
            document.UpdatedAt  = DateTime.UtcNow;
            await _db.SaveChangesAsync();

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