using Pgvector;

namespace Signature3D.Domain.Entities;

public class DocumentChunk : BaseEntity
{
    public string Content { get; set; } = string.Empty;
    public int ChunkIndex { get; set; }
    public Vector? Embedding { get; set; }     // pgvector — text-embedding-004 (768 dimensions)

    /* Relations */
    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = null!;
}