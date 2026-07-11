using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Offerings;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des offres commerciales.
/// Lectures publiques (actives) + CRUD complet pour le dashboard.
/// </summary>
public class OfferingService : IOfferingService
{
    private readonly AppDbContext _db;

    public OfferingService(AppDbContext db) => _db = db;

    /// <summary>Génère un slug propre à partir d'un nom (gère accents et caractères spéciaux).</summary>
    private static string Slugify(string name) =>
        name.ToLower().Trim()
            .Replace(" + ", "-").Replace(" ", "-")
            .Replace("°", "")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("à", "a").Replace("â", "a")
            .Replace("ô", "o").Replace("î", "i")
            .Replace("ç", "c");

    /// <summary>Mapping entité → DTO.</summary>
    private static OfferingDto ToDto(Offering o) => new()
    {
        Id = o.Id,
        Name = o.Name,
        Slug = o.Slug,
        ShortDescription = o.ShortDescription,
        ShortDescriptionEn = o.ShortDescriptionEn,
        LongDescription = o.LongDescription,
        LongDescriptionEn = o.LongDescriptionEn,
        Icon = o.Icon,
        ImageUrl = o.ImageUrl,
        Level = o.Level,
        LevelEn = o.LevelEn,
        DisplayOrder = o.DisplayOrder,
        IsActive = o.IsActive,
        IsFeatured = o.IsFeatured
    };

    /// <summary>PUBLIC — offres actives uniquement, triées par ordre d'affichage.</summary>
    public async Task<Result<List<OfferingDto>>> GetActiveAsync()
    {
        var offerings = await _db.Offerings
            .Where(o => o.IsActive)
            .OrderBy(o => o.DisplayOrder).ThenBy(o => o.Name)
            .Select(o => new OfferingDto
            {
                Id = o.Id,
                Name = o.Name,
                Slug = o.Slug,
                ShortDescription = o.ShortDescription,
                ShortDescriptionEn = o.ShortDescriptionEn,
                LongDescription = o.LongDescription,
                LongDescriptionEn = o.LongDescriptionEn,
                Icon = o.Icon,
                ImageUrl = o.ImageUrl,
                Level = o.Level,
                LevelEn = o.LevelEn,
                DisplayOrder = o.DisplayOrder,
                IsActive = o.IsActive,
                IsFeatured = o.IsFeatured
            })
            .ToListAsync();

        return Result<List<OfferingDto>>.Ok(offerings);
    }

    /// <summary>DASHBOARD — toutes les offres, même inactives.</summary>
    public async Task<Result<List<OfferingDto>>> GetAllAsync()
    {
        var offerings = await _db.Offerings
            .OrderBy(o => o.DisplayOrder).ThenBy(o => o.Name)
            .Select(o => new OfferingDto
            {
                Id = o.Id,
                Name = o.Name,
                Slug = o.Slug,
                ShortDescription = o.ShortDescription,
                ShortDescriptionEn = o.ShortDescriptionEn,
                LongDescription = o.LongDescription,
                LongDescriptionEn = o.LongDescriptionEn,
                Icon = o.Icon,
                ImageUrl = o.ImageUrl,
                Level = o.Level,
                LevelEn = o.LevelEn,
                DisplayOrder = o.DisplayOrder,
                IsActive = o.IsActive,
                IsFeatured = o.IsFeatured
            })
            .ToListAsync();

        return Result<List<OfferingDto>>.Ok(offerings);
    }

    /// <summary>Offre par son slug (ex: "matterport-ia").</summary>
    public async Task<Result<OfferingDto>> GetBySlugAsync(string slug)
    {
        var offering = await _db.Offerings.FirstOrDefaultAsync(o => o.Slug == slug);

        if (offering is null)
            return Result<OfferingDto>.Fail($"Offre '{slug}' introuvable.");

        return Result<OfferingDto>.Ok(ToDto(offering));
    }

    /// <summary>Offre par son Id (dashboard).</summary>
    public async Task<Result<OfferingDto>> GetByIdAsync(Guid id)
    {
        var offering = await _db.Offerings.FirstOrDefaultAsync(o => o.Id == id);

        if (offering is null)
            return Result<OfferingDto>.Fail("Offre introuvable.");

        return Result<OfferingDto>.Ok(ToDto(offering));
    }

    /// <summary>Crée une offre depuis le dashboard.</summary>
    public async Task<Result<OfferingDto>> CreateAsync(CreateOfferingDto dto)
    {
        var slug = Slugify(dto.Name);

        if (await _db.Offerings.AnyAsync(o => o.Slug == slug))
            return Result<OfferingDto>.Fail($"L'offre '{dto.Name}' existe déjà.");

        var offering = new Offering
        {
            Name = dto.Name,
            Slug = slug,
            ShortDescription = dto.ShortDescription,
            ShortDescriptionEn = dto.ShortDescriptionEn,
            LongDescription = dto.LongDescription,
            LongDescriptionEn = dto.LongDescriptionEn,
            Icon = dto.Icon,
            ImageUrl = dto.ImageUrl,
            Level = dto.Level,
            LevelEn = dto.LevelEn,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured
        };

        _db.Offerings.Add(offering);
        await _db.SaveChangesAsync();

        return Result<OfferingDto>.Ok(ToDto(offering));
    }

    /// <summary>Modifie une offre existante.</summary>
    public async Task<Result<OfferingDto>> UpdateAsync(Guid id, UpdateOfferingDto dto)
    {
        var offering = await _db.Offerings.FirstOrDefaultAsync(o => o.Id == id);
        if (offering is null)
            return Result<OfferingDto>.Fail("Offre introuvable.");

        var newSlug = Slugify(dto.Name);
        if (newSlug != offering.Slug && await _db.Offerings.AnyAsync(o => o.Slug == newSlug && o.Id != id))
            return Result<OfferingDto>.Fail($"L'offre '{dto.Name}' existe déjà.");

        offering.Name = dto.Name;
        offering.Slug = newSlug;
        offering.ShortDescription = dto.ShortDescription;
        offering.ShortDescriptionEn = dto.ShortDescriptionEn;
        offering.LongDescription = dto.LongDescription;
        offering.LongDescriptionEn = dto.LongDescriptionEn;
        offering.Icon = dto.Icon;
        offering.ImageUrl = dto.ImageUrl;
        offering.Level = dto.Level;
        offering.LevelEn = dto.LevelEn;
        offering.DisplayOrder = dto.DisplayOrder;
        offering.IsActive = dto.IsActive;
        offering.IsFeatured = dto.IsFeatured;

        await _db.SaveChangesAsync();

        return Result<OfferingDto>.Ok(ToDto(offering));
    }

    /// <summary>Supprime une offre (refuse si des projets l'utilisent).</summary>
    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var offering = await _db.Offerings
            .Include(o => o.Projects)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offering is null)
            return Result<bool>.Fail("Offre introuvable.");

        if (offering.Projects.Count > 0)
            return Result<bool>.Fail("Impossible de supprimer : des projets utilisent cette offre.");

        _db.Offerings.Remove(offering);
        await _db.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
}