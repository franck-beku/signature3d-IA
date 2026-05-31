namespace Signature3D.Application.DTOs.Documents;

/// <summary>
/// DTO d'un document PDF uploadé pour le RAG.
/// </summary>
public class DocumentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public bool IsIndexed { get; set; }
    public int ChunkCount { get; set; }
    public DateTime CreatedAt { get; set; }
}