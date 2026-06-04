namespace Signature3D.Application.DTOs.Sectors;

/// <summary>
/// Secteur d'activité — Automobile, Restaurant, Immobilier, etc.
/// </summary>
public class SectorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int ClientCount { get; set; }
}

/// <summary>Données pour créer un secteur depuis le dashboard.</summary>
public class CreateSectorDto
{
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Données pour modifier un secteur existant.</summary>
public class UpdateSectorDto
{
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}