namespace Signature3D.Domain.Entities;

public class Sector : BaseEntity
{
    public string Name { get; set; } = string.Empty;       // Automobile
    public string Slug { get; set; } = string.Empty;       // automobile
    public string? ImageUrl { get; set; }                  // vignette / miniature

    /* --- Champs V2 --- */
    public string? Description { get; set; }               // accroche affichée sur le site
    public string? CoverImage { get; set; }                // image plein écran (Hero du secteur)
    public string? Icon { get; set; }                      // nom d'icône (dashboard / site)
    public int DisplayOrder { get; set; }                  // ordre d'affichage
    public bool IsActive { get; set; } = true;             // visible sur le site public

    /* Navigation */
    public ICollection<Client> Clients { get; set; } = [];
    public ICollection<Project> Projects { get; set; } = [];
}