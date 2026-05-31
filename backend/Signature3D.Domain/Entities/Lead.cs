using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class Lead : BaseEntity
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string ButtonLabel { get; set; } = string.Empty;
    public LeadStatus Status { get; set; } = LeadStatus.Nouveau;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}