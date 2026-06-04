using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Sectors;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des secteurs (Automobile, Restaurant, etc.).
/// Lectures publiques (site vitrine) + CRUD réservé au dashboard.
/// </summary>
public interface ISectorService
{
    /* --- Lectures publiques (site vitrine) --- */
    Task<Result<List<SectorDto>>> GetActiveAsync();        // actifs seulement, triés
    Task<Result<SectorDto>> GetBySlugAsync(string slug);

    /* --- Lectures + CRUD dashboard --- */
    Task<Result<List<SectorDto>>> GetAllAsync();           // tous (même inactifs)
    Task<Result<SectorDto>> GetByIdAsync(Guid id);
    Task<Result<SectorDto>> CreateAsync(CreateSectorDto dto);
    Task<Result<SectorDto>> UpdateAsync(Guid id, UpdateSectorDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);

    /* --- Création automatique (conservée pour compat) --- */
    Task<Result<SectorDto>> GetOrCreateAsync(string name);
}