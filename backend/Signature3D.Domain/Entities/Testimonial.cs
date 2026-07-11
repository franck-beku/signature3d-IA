namespace Signature3D.Domain.Entities;

/// <summary>
/// Témoignage client affiché sur le site (section Témoignages).
/// Entièrement géré depuis le dashboard.
/// </summary>
public class Testimonial : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }                // traduction anglaise (nullable)
    public string? PhotoUrl { get; set; }
    public int DisplayOrder { get; set; }              // ordre d'affichage
    public bool IsPublished { get; set; } = false;      // visible sur le site public
}
