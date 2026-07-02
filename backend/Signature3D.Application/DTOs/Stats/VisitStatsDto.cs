namespace Signature3D.Application.DTOs.Stats;

/// <summary>
/// Statistiques de visites d'un projet — première métrique du module de reporting client.
/// </summary>
public class VisitStatsDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Last30Days { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
