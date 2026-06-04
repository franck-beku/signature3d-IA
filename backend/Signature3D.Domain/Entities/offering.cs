namespace Signature3D.Domain.Entities;

/// <summary>
/// Offre commerciale Signature Immersion (ce que le site appelle "Services / Solutions").
/// Nommée Offering pour éviter la confusion avec les classes de service métier.
/// Ex : Matterport, 360°, Luxedia IA, Matterport + IA, 360° + IA.
/// </summary>
public class Offering : BaseEntity
{
    public string Name { get; set; } = string.Empty;          // "Matterport + IA"
    public string Slug { get; set; } = string.Empty;          // "matterport-ia"
    public string? ShortDescription { get; set; }             // promesse courte (carte)
    public string? LongDescription { get; set; }              // description détaillée (page)
    public string? Icon { get; set; }                         // nom d'icône
    public string? ImageUrl { get; set; }                     // visuel de l'offre
    public string? Level { get; set; }                        // "Découverte", "Premium", "Signature"...
    public int DisplayOrder { get; set; }                     // ordre d'affichage
    public bool IsActive { get; set; } = true;                // visible sur le site public

    /* Navigation — un Offering est utilisé par plusieurs projets */
    public ICollection<Project> Projects { get; set; } = [];
}