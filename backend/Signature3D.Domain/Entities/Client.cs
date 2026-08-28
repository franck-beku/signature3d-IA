using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class Client : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }

    // Null pour un Prospect (pas encore de contrat) — obligatoires en pratique pour
    // EnCours/Actif, validé dans ClientService, pas au niveau du modèle.
    public DateTime? ContractDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public ClientStatus Status { get; set; } = ClientStatus.Prospect;
    public int Priority { get; set; } = 3;

    public string? ContractFileUrl { get; set; }   // ← ajouté

    /* Relations */
    public Guid SectorId { get; set; }
    public Sector Sector { get; set; } = null!;
    public ICollection<Project> Projects { get; set; } = [];
    public ICollection<Contact> Contacts { get; set; } = [];
}