using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class Visit : BaseEntity
{
    public VisitSource Source { get; set; } = VisitSource.Unknown;
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public int DurationSeconds { get; set; } = 0;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}