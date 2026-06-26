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
}