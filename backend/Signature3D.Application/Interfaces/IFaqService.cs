using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Faqs;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des questions fréquentes (FAQ).
/// Lectures publiques (site) + CRUD réservé au dashboard.
/// </summary>
public interface IFaqService
{
    /* --- Lecture publique --- */
    Task<Result<List<FaqDto>>> GetPublishedAsync();   // publiées seulement, triées

    /* --- Dashboard --- */
    Task<Result<List<FaqDto>>> GetAllAsync();          // toutes (même non publiées)
    Task<Result<FaqDto>> GetByIdAsync(Guid id);
    Task<Result<FaqDto>> CreateAsync(CreateFaqDto dto);
    Task<Result<FaqDto>> UpdateAsync(Guid id, UpdateFaqDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}