using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Stats;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de reporting client — agrège les métriques de preuve (visites, clics par bouton,
/// leads, questions Luxedia) pour un projet donné, en vue du rapport dashboard/PDF.
/// Lecture seule : la collecte (tracking) vit dans des services dédiés par entité
/// (VisitService, LeadService, ChatService, AnalyticsService.TrackEventAsync).
/// </summary>
public interface IProjectStatsService
{
    Task<Result<VisitStatsDto>> GetVisitStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null);
    Task<Result<ProjectButtonClicksDto>> GetButtonClickStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null);
}
