using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Offerings;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des offres commerciales (Offerings).
/// Lectures publiques (site vitrine) + CRUD réservé au dashboard.
/// </summary>
public interface IOfferingService
{
    /* --- Lectures publiques --- */
    Task<Result<List<OfferingDto>>> GetActiveAsync();        // actives seulement, triées
    Task<Result<OfferingDto>> GetBySlugAsync(string slug);

    /* --- Dashboard --- */
    Task<Result<List<OfferingDto>>> GetAllAsync();           // toutes (même inactives)
    Task<Result<OfferingDto>> GetByIdAsync(Guid id);
    Task<Result<OfferingDto>> CreateAsync(CreateOfferingDto dto);
    Task<Result<OfferingDto>> UpdateAsync(Guid id, UpdateOfferingDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}