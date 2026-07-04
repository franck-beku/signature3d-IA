using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Sectors;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des secteurs.
/// Lectures publiques (actifs seulement) + CRUD complet pour le dashboard.
/// </summary>
public class SectorService : ISectorService
{
    private readonly AppDbContext _db;

    public SectorService(AppDbContext db) => _db = db;

    /// <summary>Génère un slug propre à partir d'un nom (gère les accents).</summary>
    private static string Slugify(string name) =>
        name.ToLower().Trim()
            .Replace(" ", "-")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("à", "a").Replace("â", "a")
            .Replace("ô", "o").Replace("î", "i")
            .Replace("ç", "c");

    /// <summary>Mapping entité → DTO (centralisé pour éviter la duplication).</summary>
    private static SectorDto ToDto(Sector s, int clientCount = 0) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Slug = s.Slug,
        ImageUrl = s.ImageUrl,
        Description = s.Description,
        DescriptionEn = s.DescriptionEn,
        CoverImage = s.CoverImage,
        Icon = s.Icon,
        DisplayOrder = s.DisplayOrder,
        IsActive = s.IsActive,
        ClientCount = clientCount
    };

    /// <summary>PUBLIC — secteurs actifs uniquement, triés par ordre d'affichage.</summary>
    public async Task<Result<List<SectorDto>>> GetActiveAsync()
    {
        var sectors = await _db.Sectors
            .Where(s => s.IsActive)
            .Include(s => s.Clients)
            .OrderBy(s => s.DisplayOrder).ThenBy(s => s.Name)
            .Select(s => new SectorDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                ImageUrl = s.ImageUrl,
                Description = s.Description,
                DescriptionEn = s.DescriptionEn,
                CoverImage = s.CoverImage,
                Icon = s.Icon,
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive,
                ClientCount = s.Clients.Count
            })
            .ToListAsync();

        return Result<List<SectorDto>>.Ok(sectors);
    }

    /// <summary>DASHBOARD — tous les secteurs, même inactifs.</summary>
    public async Task<Result<List<SectorDto>>> GetAllAsync()
    {
        var sectors = await _db.Sectors
            .Include(s => s.Clients)
            .OrderBy(s => s.DisplayOrder).ThenBy(s => s.Name)
            .Select(s => new SectorDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                ImageUrl = s.ImageUrl,
                Description = s.Description,
                DescriptionEn = s.DescriptionEn,
                CoverImage = s.CoverImage,
                Icon = s.Icon,
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive,
                ClientCount = s.Clients.Count
            })
            .ToListAsync();

        return Result<List<SectorDto>>.Ok(sectors);
    }

    /// <summary>Retourne un secteur par son slug (ex: "automobile").</summary>
    public async Task<Result<SectorDto>> GetBySlugAsync(string slug)
    {
        var sector = await _db.Sectors
            .Include(s => s.Clients)
            .FirstOrDefaultAsync(s => s.Slug == slug);

        if (sector is null)
            return Result<SectorDto>.Fail($"Secteur '{slug}' introuvable.");

        return Result<SectorDto>.Ok(ToDto(sector, sector.Clients.Count));
    }

    /// <summary>Retourne un secteur par son Id (dashboard).</summary>
    public async Task<Result<SectorDto>> GetByIdAsync(Guid id)
    {
        var sector = await _db.Sectors
            .Include(s => s.Clients)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sector is null)
            return Result<SectorDto>.Fail("Secteur introuvable.");

        return Result<SectorDto>.Ok(ToDto(sector, sector.Clients.Count));
    }

    /// <summary>Crée un secteur depuis le dashboard.</summary>
    public async Task<Result<SectorDto>> CreateAsync(CreateSectorDto dto)
    {
        var slug = Slugify(dto.Name);

        if (await _db.Sectors.AnyAsync(s => s.Slug == slug))
            return Result<SectorDto>.Fail($"Le secteur '{dto.Name}' existe déjà.");

        var sector = new Sector
        {
            Name = dto.Name,
            Slug = slug,
            ImageUrl = dto.ImageUrl,
            Description = dto.Description,
            DescriptionEn = dto.DescriptionEn,
            CoverImage = dto.CoverImage,
            Icon = dto.Icon,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive
        };

        _db.Sectors.Add(sector);
        await _db.SaveChangesAsync();

        return Result<SectorDto>.Ok(ToDto(sector));
    }

    /// <summary>Modifie un secteur existant.</summary>
    public async Task<Result<SectorDto>> UpdateAsync(Guid id, UpdateSectorDto dto)
    {
        var sector = await _db.Sectors.FirstOrDefaultAsync(s => s.Id == id);
        if (sector is null)
            return Result<SectorDto>.Fail("Secteur introuvable.");

        // Si le nom change, on régénère le slug (en vérifiant l'unicité)
        var newSlug = Slugify(dto.Name);
        if (newSlug != sector.Slug && await _db.Sectors.AnyAsync(s => s.Slug == newSlug && s.Id != id))
            return Result<SectorDto>.Fail($"Le secteur '{dto.Name}' existe déjà.");

        sector.Name = dto.Name;
        sector.Slug = newSlug;
        sector.ImageUrl = dto.ImageUrl;
        sector.Description = dto.Description;
        sector.DescriptionEn = dto.DescriptionEn;
        sector.CoverImage = dto.CoverImage;
        sector.Icon = dto.Icon;
        sector.DisplayOrder = dto.DisplayOrder;
        sector.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();

        return Result<SectorDto>.Ok(ToDto(sector));
    }

    /// <summary>Supprime un secteur (refuse si des clients y sont rattachés).</summary>
    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var sector = await _db.Sectors
            .Include(s => s.Clients)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sector is null)
            return Result<bool>.Fail("Secteur introuvable.");

        if (sector.Clients.Count > 0)
            return Result<bool>.Fail("Impossible de supprimer : des clients sont rattachés à ce secteur.");

        _db.Sectors.Remove(sector);
        await _db.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }

    /// <summary>
    /// Retourne un secteur existant ou le crée automatiquement.
    /// Conservé pour compatibilité (création à la volée depuis un nom).
    /// </summary>
    public async Task<Result<SectorDto>> GetOrCreateAsync(string name)
    {
        var slug = Slugify(name);

        var existing = await _db.Sectors.FirstOrDefaultAsync(s => s.Slug == slug);
        if (existing is not null)
            return Result<SectorDto>.Ok(ToDto(existing));

        var sector = new Sector { Name = name, Slug = slug, IsActive = true };
        _db.Sectors.Add(sector);
        await _db.SaveChangesAsync();

        return Result<SectorDto>.Ok(ToDto(sector));
    }
}