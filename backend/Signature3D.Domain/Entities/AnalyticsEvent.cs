using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class AnalyticsEvent : BaseEntity
{
    public AnalyticsEventType EventType { get; set; }
    public string? Metadata { get; set; }   // JSON flexible

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}