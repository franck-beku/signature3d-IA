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

    /* Relations — ProjectId OPTIONNEL.
       Un lead « contact général » (site d'accueil / page contact)
       n'est rattaché à aucun projet. */
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
}