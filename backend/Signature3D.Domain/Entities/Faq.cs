namespace Signature3D.Domain.Entities;

/// <summary>
/// Question fréquente affichée sur le site (section FAQ).
/// Entièrement gérée depuis le dashboard.
/// </summary>
public class Faq : BaseEntity
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }          // ordre d'affichage
    public bool IsPublished { get; set; } = true;  // visible sur le site public
}