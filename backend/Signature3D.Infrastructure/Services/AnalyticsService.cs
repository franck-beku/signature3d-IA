using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Analytics;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service d'analytics — agrège les visites, leads et interactions par projet.
/// Fournit les données pour les graphiques du dashboard.
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _db;

    public AnalyticsService(AppDbContext db) => _db = db;

    /// <summary>Retourne les statistiques complètes d'un projet.</summary>
    public async Task<Result<ProjectAnalyticsDto>> GetByProjectAsync(Guid projectId)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<ProjectAnalyticsDto>.Fail("Projet introuvable.");

        var visits = await _db.Visits
            .Where(v => v.ProjectId == projectId)
            .ToListAsync();

        var leads = await _db.Leads
            .Where(l => l.ProjectId == projectId)
            .ToListAsync();

        var chatMessages = await _db.ChatMessages
            .Include(m => m.ChatSession)
            .Where(m => m.ChatSession.ProjectId == projectId && m.Role == "user")
            .CountAsync();

        var qrScans = await _db.AnalyticsEvents
            .Where(e => e.ProjectId == projectId && e.EventType == AnalyticsEventType.QrScan)
            .CountAsync();

        var avgDuration = visits.Any()
            ? visits.Average(v => v.DurationSeconds)
            : 0;

        // Statistiques journalières des 30 derniers jours
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var dailyStats = visits
            .Where(v => v.CreatedAt >= thirtyDaysAgo)
            .GroupBy(v => v.CreatedAt.Date)
            .Select(g => new DailyStatDto
            {
                Date = g.Key,
                Visits = g.Count(),
                Leads = leads.Count(l => l.CreatedAt.Date == g.Key)
            })
            .OrderBy(d => d.Date)
            .ToList();

        return Result<ProjectAnalyticsDto>.Ok(new ProjectAnalyticsDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            TotalVisits = visits.Count,
            TotalLeads = leads.Count,
            TotalChatMessages = chatMessages,
            TotalQrScans = qrScans,
            AvgDurationSeconds = avgDuration,
            DailyStats = dailyStats
        });
    }

    /// <summary>Enregistre un événement analytics depuis l'embed.</summary>
    public async Task<Result> TrackEventAsync(TrackEventDto dto)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Slug == dto.ProjectSlug);

        if (project is null)
            return Result.Fail("Projet introuvable.");

        if (!Enum.TryParse<AnalyticsEventType>(dto.EventType, out var eventType))
            return Result.Fail("Type d'événement invalide.");

        var analyticsEvent = new AnalyticsEvent
        {
            ProjectId = project.Id,
            EventType = eventType,
            Metadata = dto.Metadata
        };

        _db.AnalyticsEvents.Add(analyticsEvent);
        await _db.SaveChangesAsync();

        return Result.Ok();
    }
}