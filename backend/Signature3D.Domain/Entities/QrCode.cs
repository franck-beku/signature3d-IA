namespace Signature3D.Domain.Entities;

public class QrCode : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public string TargetUrl { get; set; } = string.Empty;
    public int ScanCount { get; set; } = 0;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}