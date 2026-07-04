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
            .Include(p => p.Sector)
            .Include(p => p.Offering)
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .Include(p => p.Suggestions.OrderBy(s => s.Order))
            .Include(p => p.Details)
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
            .Include(p => p.Sector)
            .Include(p => p.Offering)
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .Include(p => p.Suggestions.OrderBy(s => s.Order))
            .Include(p => p.Details)
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
            ExperienceType = Enum.TryParse<ExperienceType>(dto.ExperienceType, true, out var expType)
                ? expType : Domain.Enums.ExperienceType.Matterport,
            ExperienceUrl = dto.ExperienceUrl,   
            AmbassadorName = dto.AmbassadorName,
            WelcomeMessage = dto.WelcomeMessage ?? AppConstants.DefaultWelcomeMessage,
            WelcomeMessageEn = dto.WelcomeMessageEn ?? AppConstants.DefaultWelcomeMessageEn,
            LeadEmail = dto.LeadEmail,
            ClientId = dto.ClientId,
            Status = ProjectStatus.Active,
            ShortDescription = dto.ShortDescription,
            ShortDescriptionEn = dto.ShortDescriptionEn,
            CoverImage = dto.CoverImage,
            IsPublished  = dto.IsPublished,
            PublishedAt  = dto.IsPublished ? DateTime.UtcNow : null,
            IsFeatured   = dto.IsFeatured,
            DisplayOrder = dto.DisplayOrder,
            SectorId = dto.SectorId,
            OfferingId = dto.OfferingId,
            LuxediaAvatarUrl               = dto.LuxediaAvatarUrl,
            LuxediaClientLogoUrl           = dto.LuxediaClientLogoUrl,
            LuxediaPrimaryColor            = dto.LuxediaPrimaryColor,
            LuxediaWidgetBgColor           = dto.LuxediaWidgetBgColor,
            LuxediaBotMessageColor         = dto.LuxediaBotMessageColor,
            LuxediaUserMessageColor        = dto.LuxediaUserMessageColor,
            LuxediaWidgetPosition          = dto.LuxediaWidgetPosition,
            LuxediaButtonIcon              = dto.LuxediaButtonIcon,
            LuxediaLanguage                = dto.LuxediaLanguage,
            LuxediaTone                    = dto.LuxediaTone,
            LuxediaPersonalityInstructions = dto.LuxediaPersonalityInstructions,
            Buttons = dto.Buttons.Select((b, i) => new ProjectButton
            {
                Label = b.Label,
                Url = b.Url,
                Action = Enum.TryParse<ButtonActionType>(b.Action, true, out var action)
                    ? action : ButtonActionType.Link,
                Order = b.Order > 0 ? b.Order : i
            }).ToList(),

            Suggestions = dto.Suggestions.Select((s, i) => new ProjectSuggestion
            {
                Label = s.Label,
                LabelEn = s.LabelEn,
                Answer = s.Answer,
                AnswerEn = s.AnswerEn,
                Order = s.Order > 0 ? s.Order : i
            }).ToList(),

            Details = dto.Details.Select((d, i) => new ProjectDetail
            {
                Label = d.Label,
                Value = d.Value,
                DisplayOrder = d.DisplayOrder > 0 ? d.DisplayOrder : i,
                IsVisible = d.IsVisible
            }).ToList()
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        await _db.Entry(project).Reference(p => p.Client).LoadAsync();

        if (project.SectorId.HasValue)
            await _db.Entry(project).Reference(p => p.Sector).LoadAsync();
        if (project.OfferingId.HasValue)
            await _db.Entry(project).Reference(p => p.Offering).LoadAsync();

        return Result<ProjectDto>.Ok(MapToDto(project));
    }

    /// <summary>Modifie un projet existant — nom, Matterport ID, boutons, caractéristiques.</summary>
    public async Task<Result<ProjectDto>> UpdateAsync(Guid id, UpdateProjectDto dto)
    {
        var project = await _db.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
            return Result<ProjectDto>.Fail("Projet introuvable.");

        // Mettre à jour les champs
        bool wasPublished = project.IsPublished;
        project.Name = dto.Name;
        project.MatterportId = dto.MatterportId;
        project.ExperienceType = Enum.TryParse<ExperienceType>(dto.ExperienceType, true, out var expType)
            ? expType : Domain.Enums.ExperienceType.Matterport;
        project.ExperienceUrl = dto.ExperienceUrl;    
        project.AmbassadorName = dto.AmbassadorName;
        project.WelcomeMessage = dto.WelcomeMessage;
        project.WelcomeMessageEn = dto.WelcomeMessageEn;
        project.ShortDescription = dto.ShortDescription;
        project.ShortDescriptionEn = dto.ShortDescriptionEn;
        project.CoverImage = dto.CoverImage;
        project.IsPublished = dto.IsPublished;
        if (!wasPublished && dto.IsPublished && project.PublishedAt is null)
            project.PublishedAt = DateTime.UtcNow;
        project.IsFeatured = dto.IsFeatured;
        project.DisplayOrder = dto.DisplayOrder;
        project.SectorId = dto.SectorId;
        project.OfferingId = dto.OfferingId;
        project.LuxediaAvatarUrl               = dto.LuxediaAvatarUrl;
        project.LuxediaClientLogoUrl           = dto.LuxediaClientLogoUrl;
        project.LuxediaPrimaryColor            = dto.LuxediaPrimaryColor;
        project.LuxediaWidgetBgColor           = dto.LuxediaWidgetBgColor;
        project.LuxediaBotMessageColor         = dto.LuxediaBotMessageColor;
        project.LuxediaUserMessageColor        = dto.LuxediaUserMessageColor;
        project.LuxediaWidgetPosition          = dto.LuxediaWidgetPosition;
        project.LuxediaButtonIcon              = dto.LuxediaButtonIcon;
        project.LuxediaLanguage                = dto.LuxediaLanguage;
        project.LuxediaTone                    = dto.LuxediaTone;
        project.LuxediaPersonalityInstructions = dto.LuxediaPersonalityInstructions;
        project.UpdatedAt = DateTime.UtcNow;

        if (Enum.TryParse<ProjectStatus>(dto.Status, out var status))
            project.Status = status;

        // 1) Supprimer les anciens boutons, suggestions et caractéristiques directement en base (robuste, sans tracking)
        await _db.ProjectButtons.Where(b => b.ProjectId == project.Id).ExecuteDeleteAsync();
        await _db.ProjectSuggestions.Where(s => s.ProjectId == project.Id).ExecuteDeleteAsync();
        await _db.ProjectDetails.Where(d => d.ProjectId == project.Id).ExecuteDeleteAsync();

        // 2) Ajouter les nouveaux boutons
        var newButtons = dto.Buttons.Select((b, i) => new ProjectButton
        {
            Label = b.Label,
            Url = b.Url,
            Action = Enum.TryParse<ButtonActionType>(b.Action, true, out var action)
                ? action : ButtonActionType.Link,
            Order = b.Order > 0 ? b.Order : i,
            ProjectId = project.Id
        }).ToList();
        _db.ProjectButtons.AddRange(newButtons);

        // 3) Ajouter les nouvelles suggestions
        var newSuggestions = dto.Suggestions.Select((s, i) => new ProjectSuggestion
        {
            Label = s.Label,
            LabelEn = s.LabelEn,
            Answer = s.Answer,
            AnswerEn = s.AnswerEn,
            Order = s.Order > 0 ? s.Order : i,
            ProjectId = project.Id
        }).ToList();
        _db.ProjectSuggestions.AddRange(newSuggestions);

        // 4) Ajouter les nouvelles caractéristiques
        var newDetails = dto.Details.Select((d, i) => new ProjectDetail
        {
            Label = d.Label,
            Value = d.Value,
            DisplayOrder = d.DisplayOrder > 0 ? d.DisplayOrder : i,
            IsVisible = d.IsVisible,
            ProjectId = project.Id
        }).ToList();
        _db.ProjectDetails.AddRange(newDetails);

        await _db.SaveChangesAsync();

        // Recharger les relations pour le DTO de retour
        await _db.Entry(project).Collection(p => p.Buttons).LoadAsync();
        await _db.Entry(project).Collection(p => p.Suggestions).LoadAsync();
        await _db.Entry(project).Collection(p => p.Details).LoadAsync();
        if (project.SectorId.HasValue)
            await _db.Entry(project).Reference(p => p.Sector).LoadAsync();
        if (project.OfferingId.HasValue)
            await _db.Entry(project).Reference(p => p.Offering).LoadAsync();

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

    /* ════════════════════════════════════════
       VITRINE PUBLIQUE — page Réalisations
       Ne renvoie QUE les projets publiés.
       ════════════════════════════════════════ */

    /// <summary>Projets publiés ET en vedette — pour l'accueil.</summary>
    public async Task<Result<List<ProjectCardDto>>> GetFeaturedAsync()
    {
        var projects = await _db.Projects
            .Include(p => p.Sector)
            .Include(p => p.Offering)
            .Include(p => p.Details)
            .Where(p => p.IsPublished && p.IsFeatured)
            .OrderBy(p => p.DisplayOrder).ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Result<List<ProjectCardDto>>.Ok(projects.Select(MapToCard).ToList());
    }

    /// <summary>Retourne TOUS les projets — liste du dashboard.</summary>
    public async Task<Result<List<ProjectDto>>> GetAllAsync()
    {
        var projects = await _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Sector)
            .Include(p => p.Offering)
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .Include(p => p.Suggestions.OrderBy(s => s.Order))
            .Include(p => p.Details)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Result<List<ProjectDto>>.Ok(projects.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Projets publiés d'un secteur (page /realisations/{secteur}).
    /// Filtre optionnel par offre (ex: "matterport-ia").
    /// </summary>
    public async Task<Result<List<ProjectCardDto>>> GetPublishedBySectorAsync(string sectorSlug, string? offeringSlug = null)
    {
        var query = _db.Projects
            .Include(p => p.Sector)
            .Include(p => p.Offering)
            .Include(p => p.Details)
            .Where(p => p.IsPublished && p.Sector != null && p.Sector.Slug == sectorSlug);

        if (!string.IsNullOrWhiteSpace(offeringSlug))
            query = query.Where(p => p.Offering != null && p.Offering.Slug == offeringSlug);

        var projects = await query
            .OrderBy(p => p.DisplayOrder).ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Result<List<ProjectCardDto>>.Ok(projects.Select(MapToCard).ToList());
    }

    /// <summary>Mapping entité → DTO public léger (carte vitrine).</summary>
    private static ProjectCardDto MapToCard(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        CoverImage = p.CoverImage,
        MatterportId = p.MatterportId,
        ShortDescription = p.ShortDescription,
        ShortDescriptionEn = p.ShortDescriptionEn,
        IsFeatured = p.IsFeatured,
        DisplayOrder = p.DisplayOrder,
        SectorName = p.Sector?.Name,
        SectorSlug = p.Sector?.Slug,
        OfferingName = p.Offering?.Name,
        OfferingSlug = p.Offering?.Slug,
        Details = p.Details?
            .Where(d => d.IsVisible)
            .OrderBy(d => d.DisplayOrder)
            .Select(d => new ProjectDetailDto
            {
                Id = d.Id,
                Label = d.Label,
                Value = d.Value,
                DisplayOrder = d.DisplayOrder,
                IsVisible = d.IsVisible
            }).ToList() ?? []
    };

    /// <summary>Convertit une entité Project en DTO avec l'URL embed.</summary>
    private ProjectDto MapToDto(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        MatterportId = p.MatterportId,
        ExperienceType = p.ExperienceType.ToString(),
        ExperienceUrl = p.ExperienceUrl,
        ThumbnailUrl = p.ThumbnailUrl,
        AmbassadorName = p.AmbassadorName,
        WelcomeMessage = p.WelcomeMessage,
        WelcomeMessageEn = p.WelcomeMessageEn,
        Status = p.Status.ToString(),
        ClientName = p.Client?.Name ?? string.Empty,
        ClientId = p.ClientId,
        EmbedUrl = $"{_urls.EmbedBaseUrl}/{p.Slug}",
        ShortDescription = p.ShortDescription,
        ShortDescriptionEn = p.ShortDescriptionEn,
        CoverImage = p.CoverImage,
        IsPublished  = p.IsPublished,
        PublishedAt  = p.PublishedAt,
        IsFeatured   = p.IsFeatured,
        DisplayOrder = p.DisplayOrder,
        SectorId = p.SectorId,
        SectorName = p.Sector?.Name,
        OfferingId = p.OfferingId,
        OfferingName = p.Offering?.Name,
        LuxediaAvatarUrl               = p.LuxediaAvatarUrl,
        LuxediaClientLogoUrl           = p.LuxediaClientLogoUrl,
        LuxediaPrimaryColor            = p.LuxediaPrimaryColor,
        LuxediaWidgetBgColor           = p.LuxediaWidgetBgColor,
        LuxediaBotMessageColor         = p.LuxediaBotMessageColor,
        LuxediaUserMessageColor        = p.LuxediaUserMessageColor,
        LuxediaWidgetPosition          = p.LuxediaWidgetPosition,
        LuxediaButtonIcon              = p.LuxediaButtonIcon,
        LuxediaLanguage                = p.LuxediaLanguage,
        LuxediaTone                    = p.LuxediaTone,
        LuxediaPersonalityInstructions = p.LuxediaPersonalityInstructions,
        Buttons = p.Buttons?.OrderBy(b => b.Order).Select(b => new ProjectButtonDto
        {
            Id = b.Id,
            Label = b.Label,
            Url = b.Url,
            Action = b.Action.ToString().ToLower(),
            Order = b.Order
        }).ToList() ?? [],
        Suggestions = p.Suggestions?.OrderBy(s => s.Order).Select(s => new ProjectSuggestionDto
        {
            Id = s.Id,
            Label = s.Label,
            LabelEn = s.LabelEn,
            Answer = s.Answer,
            AnswerEn = s.AnswerEn,
            Order = s.Order
        }).ToList() ?? [],
        Details = p.Details?
            .OrderBy(d => d.DisplayOrder)
            .Select(d => new ProjectDetailDto
            {
                Id = d.Id,
                Label = d.Label,
                Value = d.Value,
                DisplayOrder = d.DisplayOrder,
                IsVisible = d.IsVisible
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