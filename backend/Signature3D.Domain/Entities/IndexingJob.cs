using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

/// <summary>
/// Job d'indexation RAG persisté — traité par DocumentIndexingBackgroundService.
/// Remplace le fire-and-forget Task.Run pour survivre à un redémarrage du process.
/// </summary>
public class IndexingJob : BaseEntity
{
    public IndexingJobStatus Status { get; set; } = IndexingJobStatus.Pending;
    public DateTime? ProcessedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public bool AttemptOcr { get; set; } = false;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = null!;
}
