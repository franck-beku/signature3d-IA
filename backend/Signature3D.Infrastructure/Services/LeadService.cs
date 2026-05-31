using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Leads;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des leads.
/// Enregistre les leads soumis par les visiteurs depuis l'interface embed.
/// </summary>
public class LeadService : ILeadService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public LeadService(AppDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    /// <summary>Retourne tous les leads paginés pour le dashboard.</summary>
    public async Task<Result<PagedResult<LeadDto>>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.Leads
            .Include(l => l.Project).ThenInclude(p => p.Client)
            .OrderByDescending(l => l.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => MapToDto(l))
            .ToListAsync();

        return Result<PagedResult<LeadDto>>.Ok(new PagedResult<LeadDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>Retourne les leads d'un projet spécifique.</summary>
    public async Task<Result<List<LeadDto>>> GetByProjectAsync(Guid projectId)
    {
        var leads = await _db.Leads
            .Include(l => l.Project).ThenInclude(p => p.Client)
            .Where(l => l.ProjectId == projectId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Result<List<LeadDto>>.Ok(leads.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Crée un nouveau lead depuis l'embed et envoie une notification email.
    /// </summary>
    public async Task<Result<LeadDto>> CreateAsync(CreateLeadDto dto)
    {
        var project = await _db.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == dto.ProjectId);

        if (project is null)
            return Result<LeadDto>.Fail("Projet introuvable.");

        var lead = new Lead
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Message = dto.Message,
            ButtonLabel = dto.ButtonLabel,
            Status = LeadStatus.Nouveau,
            ProjectId = dto.ProjectId
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        // Envoyer notification email si configuré
        if (!string.IsNullOrEmpty(project.LeadEmail))
        {
            await _email.SendLeadNotificationAsync(
                project.LeadEmail,
                project.Name,
                dto.Name ?? "Visiteur",
                dto.Message ?? dto.ButtonLabel
            );
        }

        await _db.Entry(lead).Reference(l => l.Project).LoadAsync();
        await _db.Entry(lead.Project).Reference(p => p.Client).LoadAsync();

        return Result<LeadDto>.Ok(MapToDto(lead));
    }

    /// <summary>Met à jour le statut d'un lead (Nouveau, Contacté, Converti, Perdu).</summary>
    public async Task<Result> UpdateStatusAsync(Guid id, string status)
    {
        var lead = await _db.Leads.FindAsync(id);
        if (lead is null)
            return Result.Fail("Lead introuvable.");

        if (!Enum.TryParse<LeadStatus>(status, out var leadStatus))
            return Result.Fail("Statut invalide.");

        lead.Status = leadStatus;
        lead.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    private static LeadDto MapToDto(Lead l) => new()
    {
        Id = l.Id,
        Name = l.Name,
        Email = l.Email,
        Phone = l.Phone,
        Message = l.Message,
        ButtonLabel = l.ButtonLabel,
        Status = l.Status.ToString(),
        ProjectName = l.Project?.Name ?? string.Empty,
        ClientName = l.Project?.Client?.Name ?? string.Empty,
        CreatedAt = l.CreatedAt
    };
}