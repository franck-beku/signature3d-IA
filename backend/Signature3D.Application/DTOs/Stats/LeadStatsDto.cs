namespace Signature3D.Application.DTOs.Stats;

/// <summary>
/// Nombre de leads pour un statut donné (Nouveau, Contacte, Converti, Perdu).
/// </summary>
public class LeadStatusCountDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// Statistiques de leads pour un projet — troisième métrique du module de reporting client.
/// </summary>
public class LeadStatsDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Last30Days { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public List<LeadStatusCountDto> ByStatus { get; set; } = [];
}
