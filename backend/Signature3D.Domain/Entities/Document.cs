namespace Signature3D.Domain.Entities;

public class Document : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public string? PrivateStorageReference { get; set; }
    public long SizeBytes { get; set; }
    public bool IsIndexed { get; set; } = false;
    public string? IndexingError { get; set; }
    public bool IsInternal { get; set; } = false;
    public List<int> LowTextPageNumbers { get; set; } = [];
    public List<int> OcrFailedPageNumbers { get; set; } = [];

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public ICollection<DocumentChunk> Chunks { get; set; } = [];
}