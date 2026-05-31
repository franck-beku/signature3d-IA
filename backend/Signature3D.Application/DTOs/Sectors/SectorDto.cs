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
    public int ClientCount { get; set; }
}

public class CreateSectorDto
{
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}