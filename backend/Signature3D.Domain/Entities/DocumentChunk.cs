namespace Signature3D.Domain.Entities;

public class DocumentChunk : BaseEntity
{
    public string Content { get; set; } = string.Empty;
    public int ChunkIndex { get; set; }
    public float[]? Embedding { get; set; }     // pgvector

    /* Relations */
    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = null!;
}