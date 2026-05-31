namespace Signature3D.Application.DTOs.Leads;

/// <summary>
/// DTO d'un lead généré par un visiteur.
/// </summary>
public class LeadDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string ButtonLabel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO pour créer un lead depuis l'interface embed.
/// </summary>
public class CreateLeadDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string ButtonLabel { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
}