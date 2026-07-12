using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Documents;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des documents PDF — upload, extraction, indexation RAG.
/// </summary>
public interface IDocumentService
{
    Task<Result<List<DocumentDto>>> GetByProjectAsync(Guid projectId);
    Task<Result<DocumentDto>> UploadAsync(Guid projectId, Stream fileStream, string fileName, bool isInternal = false);
    Task<Result> DeleteAsync(Guid documentId);
    Task<Result> IndexAsync(Guid documentId);
    Task<Result> SetCategoryAsync(Guid documentId, bool isInternal);

    /// <summary>Génère une URL signée à durée limitée pour consulter un document interne.</summary>
    Task<Result<string>> GetSignedUrlAsync(Guid documentId);

    /// <summary>Traite un job d'indexation en file d'attente — appelé par DocumentIndexingBackgroundService.</summary>
    Task ProcessIndexingJobAsync(Guid jobId);

    /// <summary>Génère l'embedding manquant des chunks existants qui n'en ont pas encore (rattrapage).</summary>
    Task<Result<EmbeddingBackfillResultDto>> BackfillEmbeddingsAsync();
}