using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Projects;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des projets.
/// Crée les expériences Matterport+IA ou IA seule depuis le dashboard.
/// Génère automatiquement le slug et l'URL embed.
/// </summary>
public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;
    private readonly AppUrlsSettings _urls;

    public ProjectService(AppDbContext db, AppUrlsSettings urls)
    {
        _db = db;
        _urls = urls;
    }

    /// <summary>Retourne tous les projets d'un client.</summary>
    public async Task<Result<List<ProjectDto>>> GetByClientAsync(Guid clientId)
    {
        var projects = await _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .Where(p => p.ClientId == clientId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Result<List<ProjectDto>>.Ok(projects.Select(MapToDto).ToList());
    }

    /// <summary>Retourne un projet par son slug — utilisé par l'embed.</summary>
    public async Task<Result<ProjectDto>> GetBySlugAsync(string slug)
    {
        var project = await _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .FirstOrDefaultAsync(p => p.Slug == slug);

        if (project is null)
            return Result<ProjectDto>.Fail($"Projet '{slug}' introuvable.");

        return Result<ProjectDto>.Ok(MapToDto(project));
    }

    /// <summary>Crée un nouveau projet depuis le dashboard.</summary>
    public async Task<Result<ProjectDto>> CreateAsync(CreateProjectDto dto)
    {
        // Vérifier que le client existe
        var client = await _db.Clients.FindAsync(dto.ClientId);
        if (client is null)
            return Result<ProjectDto>.Fail("Client introuvable.");

        // Générer le slug
        var slug = GenerateSlug(dto.Name);
        if (await _db.Projects.AnyAsync(p => p.Slug == slug))
            slug = $"{slug}-{DateTime.UtcNow.Ticks}";

        var project = new Project
        {
            Name = dto.Name,
            Slug = slug,
            MatterportId = dto.MatterportId,
            AmbassadorName = dto.AmbassadorName,
            WelcomeMessage = dto.WelcomeMessage ?? AppConstants.DefaultWelcomeMessage,
            LeadEmail = dto.LeadEmail,
            ClientId = dto.ClientId,
            Status = ProjectStatus.Active,
            Buttons = dto.Buttons.Select((b, i) => new ProjectButton
            {
                Label = b.Label,
                Url = b.Url,
                Action = Enum.TryParse<ButtonActionType>(b.Action, true, out var action)
                    ? action : ButtonActionType.Link,
                Order = b.Order > 0 ? b.Order : i
            }).ToList()
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        await _db.Entry(project).Reference(p => p.Client).LoadAsync();

        return Result<ProjectDto>.Ok(MapToDto(project));
    }

    /// <summary>Modifie un projet existant — nom, Matterport ID, boutons.</summary>
    public async Task<Result<ProjectDto>> UpdateAsync(Guid id, UpdateProjectDto dto)
    {
        var project = await _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Buttons)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
            return Result<ProjectDto>.Fail("Projet introuvable.");

        // Mettre à jour les champs
        project.Name = dto.Name;
        project.MatterportId = dto.MatterportId;
        project.AmbassadorName = dto.AmbassadorName;
        project.WelcomeMessage = dto.WelcomeMessage;
        project.UpdatedAt = DateTime.UtcNow;

        if (Enum.TryParse<ProjectStatus>(dto.Status, out var status))
            project.Status = status;

        // Remplacer les boutons
        _db.ProjectButtons.RemoveRange(project.Buttons);
        project.Buttons = dto.Buttons.Select((b, i) => new ProjectButton
        {
            Label = b.Label,
            Url = b.Url,
            Action = Enum.TryParse<ButtonActionType>(b.Action, true, out var action)
                ? action : ButtonActionType.Link,
            Order = b.Order > 0 ? b.Order : i,
            ProjectId = project.Id
        }).ToList();

        await _db.SaveChangesAsync();

        return Result<ProjectDto>.Ok(MapToDto(project));
    }

    /// <summary>Supprime un projet et toutes ses données (cascade).</summary>
    public async Task<Result> DeleteAsync(Guid id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project is null)
            return Result.Fail("Projet introuvable.");

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>Convertit une entité Project en DTO avec l'URL embed.</summary>
    private ProjectDto MapToDto(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        MatterportId = p.MatterportId,
        ThumbnailUrl = p.ThumbnailUrl,
        AmbassadorName = p.AmbassadorName,
        WelcomeMessage = p.WelcomeMessage,
        Status = p.Status.ToString(),
        ClientName = p.Client?.Name ?? string.Empty,
        EmbedUrl = $"{_urls.EmbedBaseUrl}/{p.Slug}",
        Buttons = p.Buttons?.Select(b => new ProjectButtonDto
        {
            Id = b.Id,
            Label = b.Label,
            Url = b.Url,
            Action = b.Action.ToString().ToLower(),
            Order = b.Order
        }).ToList() ?? [],
        CreatedAt = p.CreatedAt
    };

    /// <summary>Génère un slug URL-friendly à partir d'un nom.</summary>
    private static string GenerateSlug(string name) =>
        name.ToLower()
            .Replace(" ", "-")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("à", "a").Replace("â", "a")
            .Replace("ô", "o").Replace("î", "i")
            .Replace("ç", "c")
            .Replace("'", "").Replace("'", "");
}