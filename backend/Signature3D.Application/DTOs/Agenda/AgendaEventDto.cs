namespace Signature3D.Application.DTOs.Agenda;

public class AgendaEventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }

    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }

    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
}
