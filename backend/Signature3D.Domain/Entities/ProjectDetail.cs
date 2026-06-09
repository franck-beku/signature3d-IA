namespace Signature3D.Domain.Entities;

/// <summary>
/// Caractéristique personnalisée d'un projet (paire libellé / valeur).
/// Exemples : "Prix" → "89 900 $", "Kilométrage" → "12 000 km",
/// "Superficie" → "2 400 pi²". Flexible selon le secteur.
/// </summary>
public class ProjectDetail : BaseEntity
{
    public string Label { get; set; } = string.Empty;   // "Prix"
    public string Value { get; set; } = string.Empty;   // "89 900 $"
    public int DisplayOrder { get; set; }                // ordre d'affichage
    public bool IsVisible { get; set; } = true;          // afficher / masquer sur la carte

    /* Relation */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}