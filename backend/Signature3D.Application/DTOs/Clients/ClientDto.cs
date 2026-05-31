namespace Signature3D.Application.DTOs.Clients;

/// <summary>
/// DTO complet d'un client avec ses projets.
/// </summary>
public class ClientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public DateTime ContractDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Priority { get; set; }
    public Guid SectorId { get; set; }        // ← ajouté
    public string SectorName { get; set; } = string.Empty;
    public string SectorSlug { get; set; } = string.Empty;
    public int ProjectCount { get; set; }
    public string? ContractFileUrl { get; set; }   // ← ajouté
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO pour créer un nouveau client depuis le dashboard.
/// </summary>
public class CreateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public DateTime ContractDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string Status { get; set; } = "Prospect";
    public int Priority { get; set; } = 3;
    public Guid SectorId { get; set; }
}

/// <summary>
/// DTO pour modifier un client existant.
/// </summary>
public class UpdateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public DateTime ContractDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Priority { get; set; }
    public Guid SectorId { get; set; }
}