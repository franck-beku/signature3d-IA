using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Sectors;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des secteurs (Automobile, Restaurant, etc.).
/// Crée automatiquement un secteur si inexistant.
/// </summary>
public interface ISectorService
{
    Task<Result<List<SectorDto>>> GetAllAsync();
    Task<Result<SectorDto>> GetBySlugAsync(string slug);
    Task<Result<SectorDto>> GetOrCreateAsync(string name);
}