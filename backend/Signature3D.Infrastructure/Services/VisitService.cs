using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Visits;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de tracking des visites sur les expériences embed.
/// Enregistre chaque visite avec sa source (lien direct, QR code, iframe).
/// </summary>
public class VisitService : IVisitService
{
    private readonly AppDbContext _db;

    public VisitService(AppDbContext db) => _db = db;

    /// <summary>Enregistre une nouvelle visite sur un projet.</summary>
    public async Task<Result<VisitDto>> CreateAsync(CreateVisitDto dto)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Slug == dto.ProjectSlug);

        if (project is null)
            return Result<VisitDto>.Fail("Projet introuvable.");

        if (!Enum.TryParse<VisitSource>(dto.Source, out var source))
            source = VisitSource.Unknown;

        var visit = new Visit
        {
            ProjectId = project.Id,
            Source = source,
            UserAgent = dto.UserAgent
        };

        _db.Visits.Add(visit);
        await _db.SaveChangesAsync();

        return Result<VisitDto>.Ok(new VisitDto
        {
            Id = visit.Id,
            Source = visit.Source.ToString(),
            DurationSeconds = visit.DurationSeconds,
            CreatedAt = visit.CreatedAt
        });
    }

    /// <summary>Met à jour la durée d'une visite quand le visiteur quitte.</summary>
    public async Task<Result> UpdateDurationAsync(Guid visitId, int durationSeconds)
    {
        var visit = await _db.Visits.FindAsync(visitId);
        if (visit is null)
            return Result.Fail("Visite introuvable.");

        visit.DurationSeconds = durationSeconds;
        visit.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result.Ok();
    }
}