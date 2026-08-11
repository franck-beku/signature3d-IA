using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Testimonials;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
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

    /* Illustrations de secours (silhouettes stylisées) — utilisées uniquement quand aucune
       photo n'a été fournie, choisies selon le genre interne. Jamais de texte "Homme"/"Femme"
       n'atteint le visiteur : seul ce chemin d'image, opaque, est exposé. */
    private const string AvatarHomme = "/assets/avatars/silhouette-homme.svg";
    private const string AvatarFemme = "/assets/avatars/silhouette-femme.svg";

    /// <summary>
    /// Résout l'avatar public d'un témoignage : vraie photo si fournie, sinon illustration
    /// de secours selon le genre, sinon null (le frontend applique alors le filet de
    /// sécurité final — initiales sur dégradé doré).
    /// </summary>
    private static string? ResolveAvatarUrl(Testimonial t) => t.PhotoUrl ?? t.Gender switch
    {
        TestimonialGender.Homme => AvatarHomme,
        TestimonialGender.Femme => AvatarFemme,
        _ => null,
    };

    /// <summary>Mapping entité → DTO public.</summary>
    private static TestimonialDto ToPublicDto(Testimonial t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Company = t.Company,
        CompanyEn = t.CompanyEn,
        Quote = t.Quote,
        QuoteEn = t.QuoteEn,
        AvatarUrl = ResolveAvatarUrl(t),
        DisplayOrder = t.DisplayOrder,
        IsPublished = t.IsPublished
    };

    /// <summary>Mapping entité → DTO admin (dashboard).</summary>
    private static TestimonialAdminDto ToAdminDto(Testimonial t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Company = t.Company,
        CompanyEn = t.CompanyEn,
        Quote = t.Quote,
        QuoteEn = t.QuoteEn,
        PhotoUrl = t.PhotoUrl,
        Gender = t.Gender,
        DisplayOrder = t.DisplayOrder,
        IsPublished = t.IsPublished
    };

    /// <summary>PUBLIC — témoignages publiés uniquement, triés par ordre d'affichage.</summary>
    public async Task<Result<List<TestimonialDto>>> GetPublishedAsync()
    {
        // Récupération des entités d'abord (Gender doit être résolu côté C#, pas traduisible
        // en SQL), puis projection en DTO public en mémoire.
        var testimonials = await _db.Testimonials
            .Where(t => t.IsPublished)
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync();

        return Result<List<TestimonialDto>>.Ok(testimonials.Select(ToPublicDto).ToList());
    }

    /// <summary>DASHBOARD — tous les témoignages, même non publiés.</summary>
    public async Task<Result<List<TestimonialAdminDto>>> GetAllAsync()
    {
        var testimonials = await _db.Testimonials
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync();

        return Result<List<TestimonialAdminDto>>.Ok(testimonials.Select(ToAdminDto).ToList());
    }

    /// <summary>Témoignage par son Id (dashboard).</summary>
    public async Task<Result<TestimonialAdminDto>> GetByIdAsync(Guid id)
    {
        var testimonial = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id);

        if (testimonial is null)
            return Result<TestimonialAdminDto>.Fail("Témoignage introuvable.");

        return Result<TestimonialAdminDto>.Ok(ToAdminDto(testimonial));
    }

    /// <summary>Crée un témoignage depuis le dashboard.</summary>
    public async Task<Result<TestimonialAdminDto>> CreateAsync(CreateTestimonialDto dto)
    {
        var testimonial = new Testimonial
        {
            Name = dto.Name,
            Company = dto.Company,
            CompanyEn = dto.CompanyEn,
            Quote = dto.Quote,
            QuoteEn = dto.QuoteEn,
            PhotoUrl = dto.PhotoUrl,
            Gender = dto.Gender,
            DisplayOrder = dto.DisplayOrder,
            IsPublished = dto.IsPublished
        };

        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();

        return Result<TestimonialAdminDto>.Ok(ToAdminDto(testimonial));
    }

    /// <summary>Modifie un témoignage existant.</summary>
    public async Task<Result<TestimonialAdminDto>> UpdateAsync(Guid id, UpdateTestimonialDto dto)
    {
        var testimonial = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id);
        if (testimonial is null)
            return Result<TestimonialAdminDto>.Fail("Témoignage introuvable.");

        testimonial.Name = dto.Name;
        testimonial.Company = dto.Company;
        testimonial.CompanyEn = dto.CompanyEn;
        testimonial.Quote = dto.Quote;
        testimonial.QuoteEn = dto.QuoteEn;
        testimonial.PhotoUrl = dto.PhotoUrl;
        testimonial.Gender = dto.Gender;
        testimonial.DisplayOrder = dto.DisplayOrder;
        testimonial.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();

        return Result<TestimonialAdminDto>.Ok(ToAdminDto(testimonial));
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
