using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Sectors;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des secteurs.
/// Crée automatiquement un secteur s'il n'existe pas encore —
/// permet au dashboard d'ajouter n'importe quel secteur sans toucher au code.
/// </summary>
public class SectorService : ISectorService
{
    private readonly AppDbContext _db;

    public SectorService(AppDbContext db) => _db = db;

    /// <summary>Retourne tous les secteurs avec le nombre de clients.</summary>
    public async Task<Result<List<SectorDto>>> GetAllAsync()
    {
        var sectors = await _db.Sectors
            .Include(s => s.Clients)
            .OrderBy(s => s.Name)
            .Select(s => new SectorDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                ImageUrl = s.ImageUrl,
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

        return Result<SectorDto>.Ok(new SectorDto
        {
            Id = sector.Id,
            Name = sector.Name,
            Slug = sector.Slug,
            ImageUrl = sector.ImageUrl,
            ClientCount = sector.Clients.Count
        });
    }

    /// <summary>
    /// Retourne un secteur existant ou le crée automatiquement.
    /// Ex: "Automobile" → crée le secteur si inexistant → retourne l'ID.
    /// </summary>
    public async Task<Result<SectorDto>> GetOrCreateAsync(string name)
    {
        var slug = name.ToLower()
            .Replace(" ", "-")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("à", "a").Replace("â", "a")
            .Replace("ô", "o").Replace("î", "i")
            .Replace("ç", "c");

        var existing = await _db.Sectors.FirstOrDefaultAsync(s => s.Slug == slug);
        if (existing is not null)
        {
            return Result<SectorDto>.Ok(new SectorDto
            {
                Id = existing.Id,
                Name = existing.Name,
                Slug = existing.Slug,
            });
        }

        // Créer automatiquement le secteur
        var sector = new Sector { Name = name, Slug = slug };
        _db.Sectors.Add(sector);
        await _db.SaveChangesAsync();

        return Result<SectorDto>.Ok(new SectorDto
        {
            Id = sector.Id,
            Name = sector.Name,
            Slug = sector.Slug,
        });
    }
}