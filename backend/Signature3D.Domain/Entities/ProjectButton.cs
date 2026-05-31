using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class ProjectButton : BaseEntity
{
    public string Label { get; set; } = string.Empty;
    public string? Url { get; set; }
    public ButtonActionType Action { get; set; } = ButtonActionType.Link;
    public int Order { get; set; } = 0;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}