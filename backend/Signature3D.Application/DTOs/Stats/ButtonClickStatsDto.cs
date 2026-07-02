namespace Signature3D.Application.DTOs.Stats;

/// <summary>
/// Nombre de clics pour un bouton d'action donné.
/// Regroupement par libellé (Metadata de l'AnalyticsEvent) — pas de lien direct vers
/// ProjectButton aujourd'hui, voir limite connue : un renommage de bouton scinde l'historique.
/// </summary>
public class ButtonClickStatsDto
{
    public string ButtonLabel { get; set; } = string.Empty;
    public int ClickCount { get; set; }
}

/// <summary>
/// Statistiques de clics par bouton pour un projet — deuxième métrique du module de reporting client.
/// </summary>
public class ProjectButtonClicksDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int TotalClicks { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public List<ButtonClickStatsDto> Buttons { get; set; } = [];
}
