using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Faqs;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des FAQ.
/// Lectures publiques (publiées) + CRUD complet pour le dashboard.
/// </summary>
public class FaqService : IFaqService
{
    private readonly AppDbContext _db;

    public FaqService(AppDbContext db) => _db = db;

    /// <summary>Mapping entité → DTO.</summary>
    private static FaqDto ToDto(Faq f) => new()
    {
        Id = f.Id,
        Question = f.Question,
        QuestionEn = f.QuestionEn,
        Answer = f.Answer,
        AnswerEn = f.AnswerEn,
        DisplayOrder = f.DisplayOrder,
        IsPublished = f.IsPublished
    };

    /// <summary>PUBLIC — FAQ publiées uniquement, triées par ordre d'affichage.</summary>
    public async Task<Result<List<FaqDto>>> GetPublishedAsync()
    {
        var faqs = await _db.Faqs
            .Where(f => f.IsPublished)
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync();

        return Result<List<FaqDto>>.Ok(faqs.Select(ToDto).ToList());
    }

    /// <summary>DASHBOARD — toutes les FAQ, même non publiées.</summary>
    public async Task<Result<List<FaqDto>>> GetAllAsync()
    {
        var faqs = await _db.Faqs
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync();

        return Result<List<FaqDto>>.Ok(faqs.Select(ToDto).ToList());
    }

    /// <summary>FAQ par son Id (dashboard).</summary>
    public async Task<Result<FaqDto>> GetByIdAsync(Guid id)
    {
        var faq = await _db.Faqs.FirstOrDefaultAsync(f => f.Id == id);

        if (faq is null)
            return Result<FaqDto>.Fail("FAQ introuvable.");

        return Result<FaqDto>.Ok(ToDto(faq));
    }

    /// <summary>Crée une FAQ depuis le dashboard.</summary>
    public async Task<Result<FaqDto>> CreateAsync(CreateFaqDto dto)
    {
        var faq = new Faq
        {
            Question = dto.Question,
            QuestionEn = dto.QuestionEn,
            Answer = dto.Answer,
            AnswerEn = dto.AnswerEn,
            DisplayOrder = dto.DisplayOrder,
            IsPublished = dto.IsPublished
        };

        _db.Faqs.Add(faq);
        await _db.SaveChangesAsync();

        return Result<FaqDto>.Ok(ToDto(faq));
    }

    /// <summary>Modifie une FAQ existante.</summary>
    public async Task<Result<FaqDto>> UpdateAsync(Guid id, UpdateFaqDto dto)
    {
        var faq = await _db.Faqs.FirstOrDefaultAsync(f => f.Id == id);
        if (faq is null)
            return Result<FaqDto>.Fail("FAQ introuvable.");

        faq.Question = dto.Question;
        faq.QuestionEn = dto.QuestionEn;
        faq.Answer = dto.Answer;
        faq.AnswerEn = dto.AnswerEn;
        faq.DisplayOrder = dto.DisplayOrder;
        faq.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();

        return Result<FaqDto>.Ok(ToDto(faq));
    }

    /// <summary>Supprime une FAQ.</summary>
    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var faq = await _db.Faqs.FirstOrDefaultAsync(f => f.Id == id);
        if (faq is null)
            return Result<bool>.Fail("FAQ introuvable.");

        _db.Faqs.Remove(faq);
        await _db.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
}