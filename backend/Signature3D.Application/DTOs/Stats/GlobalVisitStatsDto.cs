namespace Signature3D.Application.DTOs.Stats;

/// <summary>
/// Statistiques de visites tous projets confondus — utilisé par la vue globale du dashboard.
/// Même structure que VisitStatsDto, sans le scope par projet.
/// </summary>
public class GlobalVisitStatsDto
{
    public int Total { get; set; }
    public int Last30Days { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
