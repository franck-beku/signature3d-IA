namespace Signature3D.Application.DTOs.Analytics;

/// <summary>
/// Statistiques globales d'un projet.
/// </summary>
public class ProjectAnalyticsDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int TotalVisits { get; set; }
    public int TotalLeads { get; set; }
    public int TotalChatMessages { get; set; }
    public int TotalQrScans { get; set; }
    public double AvgDurationSeconds { get; set; }
    public List<DailyStatDto> DailyStats { get; set; } = [];
}

/// <summary>
/// Statistiques journalières pour les graphiques du dashboard.
/// </summary>
public class DailyStatDto
{
    public DateTime Date { get; set; }
    public int Visits { get; set; }
    public int Leads { get; set; }
}

/// <summary>
/// Événement analytics envoyé depuis l'embed.
/// </summary>
public class TrackEventDto
{
    public string EventType { get; set; } = string.Empty;
    public string ProjectSlug { get; set; } = string.Empty;
    public string? Metadata { get; set; }
}