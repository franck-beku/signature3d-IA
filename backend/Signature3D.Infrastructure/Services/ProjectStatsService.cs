using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Stats;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de reporting client — agrège les métriques de preuve pour le rapport dashboard/PDF.
/// Lecture seule : ne modifie jamais les données de tracking (voir VisitService, LeadService,
/// ChatService et AnalyticsService.TrackEventAsync pour l'écriture).
/// </summary>
public class ProjectStatsService : IProjectStatsService
{
    private readonly AppDbContext _db;

    public ProjectStatsService(AppDbContext db) => _db = db;

    /// <summary>
    /// Statistiques de visites d'un projet — total (filtrable par date) + repère fixe sur 30 jours.
    /// </summary>
    public async Task<Result<VisitStatsDto>> GetVisitStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<VisitStatsDto>.Fail("Projet introuvable.");

        var query = _db.Visits.Where(v => v.ProjectId == projectId);

        if (from is not null) query = query.Where(v => v.CreatedAt >= from);
        if (to is not null) query = query.Where(v => v.CreatedAt <= to);

        var total = await query.CountAsync();

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var last30Days = await _db.Visits
            .Where(v => v.ProjectId == projectId && v.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        return Result<VisitStatsDto>.Ok(new VisitStatsDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            Total = total,
            Last30Days = last30Days,
            From = from,
            To = to
        });
    }
}
