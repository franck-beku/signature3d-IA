namespace Signature3D.Application.DTOs.Timeline;

public class TimelineItemDto
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
}
