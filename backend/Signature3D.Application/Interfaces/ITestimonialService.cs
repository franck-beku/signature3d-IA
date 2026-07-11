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
    Task<Result<List<TestimonialDto>>> GetAllAsync();          // tous (même non publiés)
    Task<Result<TestimonialDto>> GetByIdAsync(Guid id);
    Task<Result<TestimonialDto>> CreateAsync(CreateTestimonialDto dto);
    Task<Result<TestimonialDto>> UpdateAsync(Guid id, UpdateTestimonialDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}
