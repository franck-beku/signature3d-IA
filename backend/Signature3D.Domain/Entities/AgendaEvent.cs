using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class AgendaEvent : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public EventType Type { get; set; } = EventType.RendezVousCommercial;
    public string? Location { get; set; }
    public string? Notes { get; set; }

    /* Relations optionnelles — OnDelete: SetNull (l'événement survit à la suppression du lié) */
    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid? ContactId { get; set; }
    public Contact? Contact { get; set; }
}
