namespace Signature3D.Domain.Entities;

public class Document : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public bool IsIndexed { get; set; } = false;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public ICollection<DocumentChunk> Chunks { get; set; } = [];
}