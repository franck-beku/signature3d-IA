using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Testimonials;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des témoignages clients.
/// Lectures publiques (publiés) + CRUD complet pour le dashboard.
/// </summary>
public class TestimonialService : ITestimonialService
{
    private readonly AppDbContext _db;

    public TestimonialService(AppDbContext db) => _db = db;

    /// <summary>Mapping entité → DTO.</summary>
    private static TestimonialDto ToDto(Testimonial t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Company = t.Company,
        Quote = t.Quote,
        QuoteEn = t.QuoteEn,
        PhotoUrl = t.PhotoUrl,
        DisplayOrder = t.DisplayOrder,
        IsPublished = t.IsPublished
    };

    /// <summary>PUBLIC — témoignages publiés uniquement, triés par ordre d'affichage.</summary>
    public async Task<Result<List<TestimonialDto>>> GetPublishedAsync()
    {
        var testimonials = await _db.Testimonials
            .Where(t => t.IsPublished)
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialDto
            {
                Id = t.Id,
                Name = t.Name,
                Company = t.Company,
                Quote = t.Quote,
                QuoteEn = t.QuoteEn,
                PhotoUrl = t.PhotoUrl,
                DisplayOrder = t.DisplayOrder,
                IsPublished = t.IsPublished
            })
            .ToListAsync();

        return Result<List<TestimonialDto>>.Ok(testimonials);
    }

    /// <summary>DASHBOARD — tous les témoignages, même non publiés.</summary>
    public async Task<Result<List<TestimonialDto>>> GetAllAsync()
    {
        var testimonials = await _db.Testimonials
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialDto
            {
                Id = t.Id,
                Name = t.Name,
                Company = t.Company,
                Quote = t.Quote,
                QuoteEn = t.QuoteEn,
                PhotoUrl = t.PhotoUrl,
                DisplayOrder = t.DisplayOrder,
                IsPublished = t.IsPublished
            })
            .ToListAsync();

        return Result<List<TestimonialDto>>.Ok(testimonials);
    }

    /// <summary>Témoignage par son Id (dashboard).</summary>
    public async Task<Result<TestimonialDto>> GetByIdAsync(Guid id)
    {
        var testimonial = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id);

        if (testimonial is null)
            return Result<TestimonialDto>.Fail("Témoignage introuvable.");

        return Result<TestimonialDto>.Ok(ToDto(testimonial));
    }

    /// <summary>Crée un témoignage depuis le dashboard.</summary>
    public async Task<Result<TestimonialDto>> CreateAsync(CreateTestimonialDto dto)
    {
        var testimonial = new Testimonial
        {
            Name = dto.Name,
            Company = dto.Company,
            Quote = dto.Quote,
            QuoteEn = dto.QuoteEn,
            PhotoUrl = dto.PhotoUrl,
            DisplayOrder = dto.DisplayOrder,
            IsPublished = dto.IsPublished
        };

        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();

        return Result<TestimonialDto>.Ok(ToDto(testimonial));
    }

    /// <summary>Modifie un témoignage existant.</summary>
    public async Task<Result<TestimonialDto>> UpdateAsync(Guid id, UpdateTestimonialDto dto)
    {
        var testimonial = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id);
        if (testimonial is null)
            return Result<TestimonialDto>.Fail("Témoignage introuvable.");

        testimonial.Name = dto.Name;
        testimonial.Company = dto.Company;
        testimonial.Quote = dto.Quote;
        testimonial.QuoteEn = dto.QuoteEn;
        testimonial.PhotoUrl = dto.PhotoUrl;
        testimonial.DisplayOrder = dto.DisplayOrder;
        testimonial.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();

        return Result<TestimonialDto>.Ok(ToDto(testimonial));
    }

    /// <summary>Supprime un témoignage.</summary>
    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var testimonial = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id);
        if (testimonial is null)
            return Result<bool>.Fail("Témoignage introuvable.");

        _db.Testimonials.Remove(testimonial);
        await _db.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
}
