namespace Signature3D.Application.DTOs.Agenda;

public class CreateAgendaEventDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public string Type { get; set; } = "RendezVousCommercial";
    public string? Location { get; set; }
    public string? Notes { get; set; }

    public Guid? ClientId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? ContactId { get; set; }
}
