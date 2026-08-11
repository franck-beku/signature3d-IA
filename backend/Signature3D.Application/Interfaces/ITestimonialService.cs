using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Testimonials;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des témoignages clients.
/// Lectures publiques (publiés) + CRUD réservé au dashboard.
/// </summary>
public interface ITestimonialService
{
    /* --- Lecture publique --- */
    Task<Result<List<TestimonialDto>>> GetPublishedAsync();   // publiés seulement, triés

    /* --- Dashboard --- */
    Task<Result<List<TestimonialAdminDto>>> GetAllAsync();     // tous (même non publiés)
    Task<Result<TestimonialAdminDto>> GetByIdAsync(Guid id);
    Task<Result<TestimonialAdminDto>> CreateAsync(CreateTestimonialDto dto);
    Task<Result<TestimonialAdminDto>> UpdateAsync(Guid id, UpdateTestimonialDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}
