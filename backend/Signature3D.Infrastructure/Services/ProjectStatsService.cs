using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Stats;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de reporting client — agrège les métriques de preuve pour le rapport dashboard/PDF.
/// Lecture seule : ne modifie jamais les données de tracking (voir VisitService, LeadService,
/// ChatService et AnalyticsService.TrackEventAsync pour l'écriture).
/// </summary>
public class ProjectStatsService : IProjectStatsService
{
    private readonly AppDbContext _db;

    public ProjectStatsService(AppDbContext db) => _db = db;

    /// <summary>
    /// Catégories métier pour les questions Luxedia — mots-clés bilingues FR/EN, écrits en français
    /// accentué lisible (la normalisation est appliquée automatiquement, voir QuestionCategories).
    /// Ordre significatif : la première catégorie dont un mot-clé matche l'emporte.
    /// Pour enrichir : ajouter/retirer des mots-clés ici directement.
    /// </summary>
    private static readonly (string Category, string[] Keywords)[] RawQuestionCategories =
    [
        ("Horaires", ["horaire", "ouvert", "ouverture", "fermeture", "fermé", "dimanche", "samedi", "heure", "quand",
                       "hours", "open", "opening", "closed", "close", "sunday", "saturday", "time", "when"]),
        ("Prix / tarifs", ["prix", "tarif", "combien", "coût", "cher", "abonnement", "payer", "gratuit",
                            "price", "cost", "how much", "expensive", "fee", "subscription", "pay", "free"]),
        ("Rendez-vous", ["rdv", "rendez-vous", "réserver", "réservation", "visite", "rencontrer",
                          "appointment", "book", "booking", "reserve", "schedule", "meet", "visit"]),
        ("Localisation", ["adresse", "situé", "localisation", "trouver", "ville", "carte",
                           "where", "address", "located", "location", "find", "city", "map", "directions"]),
        ("Services", ["service", "proposer", "offrez", "faites-vous", "disponible",
                       "offer", "provide", "do you", "available"]),
        ("Garantie", ["garantie", "garanti", "assurance", "warranty", "guarantee", "insurance"]),
        ("Financement", ["financement", "crédit", "paiement", "mensualité", "financer",
                          "financing", "payment", "installment", "finance", "loan"]),
        ("Contact", ["contact", "contacter", "téléphone", "email", "joindre", "appeler",
                      "phone", "reach", "call"]),
        ("Livraison", ["livraison", "livrer", "délai", "expédition", "delivery", "deliver", "shipping", "lead time"]),
    ];

    /// <summary>
    /// Version normalisée de RawQuestionCategories, compilée en une expression régulière par mot-clé
    /// avec délimiteurs \b (mot entier / séquence de mots exacte) — calculée une seule fois.
    /// "fee" ne matche plus "coffee", "book" ne matche plus "Facebook", etc.
    /// </summary>
    private static readonly (string Category, Regex[] Patterns)[] QuestionCategories =
        RawQuestionCategories
            .Select(c => (c.Category, c.Keywords
                .Select(k => new Regex(@"\b" + Regex.Escape(NormalizeText(k)) + @"\b", RegexOptions.Compiled))
                .ToArray()))
            .ToArray();

    /// <summary>Minuscules + suppression des accents (é→e, à→a...) — no-op sur du texte déjà ASCII.</summary>
    private static string NormalizeText(string text)
    {
        var decomposed = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString();
    }

    /// <summary>
    /// Première catégorie dont un mot-clé (mot entier) ou une expression (séquence exacte de mots)
    /// apparaît dans la question normalisée, sinon "Autre".
    /// </summary>
    private static string CategorizeQuestion(string normalizedContent)
    {
        foreach (var (category, patterns) in QuestionCategories)
        {
            if (patterns.Any(p => p.IsMatch(normalizedContent)))
                return category;
        }
        return "Autre";
    }

    /// <summary>
    /// Statistiques de visites d'un projet — total (filtrable par date) + repère fixe sur 30 jours.
    /// </summary>
    public async Task<Result<VisitStatsDto>> GetVisitStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<VisitStatsDto>.Fail("Projet introuvable.");

        var query = _db.Visits.Where(v => v.ProjectId == projectId);

        if (from is not null) query = query.Where(v => v.CreatedAt >= from);
        if (to is not null) query = query.Where(v => v.CreatedAt <= to);

        var total = await query.CountAsync();

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var last30Days = await _db.Visits
            .Where(v => v.ProjectId == projectId && v.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        return Result<VisitStatsDto>.Ok(new VisitStatsDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            Total = total,
            Last30Days = last30Days,
            From = from,
            To = to
        });
    }

    /// <summary>
    /// Nombre de clics par bouton d'action d'un projet, trié du plus cliqué au moins cliqué.
    /// Regroupe par libellé (Metadata) — voir limite documentée sur ButtonClickStatsDto.
    /// </summary>
    public async Task<Result<ProjectButtonClicksDto>> GetButtonClickStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<ProjectButtonClicksDto>.Fail("Projet introuvable.");

        var query = _db.AnalyticsEvents.Where(e =>
            e.ProjectId == projectId &&
            e.EventType == AnalyticsEventType.ButtonClick &&
            e.Metadata != null && e.Metadata != "");

        if (from is not null) query = query.Where(e => e.CreatedAt >= from);
        if (to is not null) query = query.Where(e => e.CreatedAt <= to);

        var buttons = await query
            .GroupBy(e => e.Metadata)
            .Select(g => new ButtonClickStatsDto
            {
                ButtonLabel = g.Key!,
                ClickCount = g.Count()
            })
            .OrderByDescending(b => b.ClickCount)
            .ToListAsync();

        return Result<ProjectButtonClicksDto>.Ok(new ProjectButtonClicksDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            TotalClicks = buttons.Sum(b => b.ClickCount),
            From = from,
            To = to,
            Buttons = buttons
        });
    }

    /// <summary>
    /// Statistiques de leads d'un projet — total (filtrable par date), repère fixe 30 jours,
    /// et découpage par statut.
    /// </summary>
    public async Task<Result<LeadStatsDto>> GetLeadStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<LeadStatsDto>.Fail("Projet introuvable.");

        var query = _db.Leads.Where(l => l.ProjectId == projectId);

        if (from is not null) query = query.Where(l => l.CreatedAt >= from);
        if (to is not null) query = query.Where(l => l.CreatedAt <= to);

        var total = await query.CountAsync();

        // GroupBy matérialisé avant .ToString() sur l'enum — évite de compter sur la traduction SQL du provider.
        var byStatusRaw = await query
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var byStatus = byStatusRaw
            .Select(x => new LeadStatusCountDto { Status = x.Status.ToString(), Count = x.Count })
            .OrderByDescending(x => x.Count)
            .ToList();

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var last30Days = await _db.Leads
            .Where(l => l.ProjectId == projectId && l.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        return Result<LeadStatsDto>.Ok(new LeadStatsDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            Total = total,
            Last30Days = last30Days,
            From = from,
            To = to,
            ByStatus = byStatus
        });
    }

    /// <summary>
    /// Questions visiteur posées à Luxedia, regroupées par catégorie métier (mots-clés bilingues FR/EN).
    /// Catégorisation en mémoire — les questions sont formulées trop différemment pour un GroupBy SQL exact.
    /// </summary>
    public async Task<Result<ProjectQuestionStatsDto>> GetLuxediaQuestionStatsAsync(Guid projectId, DateTime? from = null, DateTime? to = null)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<ProjectQuestionStatsDto>.Fail("Projet introuvable.");

        var query = _db.ChatMessages
            .Where(m => m.ChatSession.ProjectId == projectId && m.Role == "user");

        if (from is not null) query = query.Where(m => m.CreatedAt >= from);
        if (to is not null) query = query.Where(m => m.CreatedAt <= to);

        var questions = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => m.Content)
            .ToListAsync();

        // Zero-fill : toutes les catégories (dont "Autre") apparaissent toujours, même à 0.
        var counts = QuestionCategories.ToDictionary(c => c.Category, _ => 0);
        counts["Autre"] = 0;

        var uncategorized = new List<string>();

        foreach (var content in questions)
        {
            var category = CategorizeQuestion(NormalizeText(content));
            counts[category]++;

            // "questions" est déjà trié du plus récent au plus ancien — on garde donc naturellement
            // les 50 questions "Autre" les plus récentes en s'arrêtant dès que la limite est atteinte.
            if (category == "Autre" && uncategorized.Count < 50)
                uncategorized.Add(content);
        }

        var categories = counts
            .Select(kv => new QuestionCategoryStatsDto { Category = kv.Key, Count = kv.Value })
            .OrderByDescending(c => c.Count)
            .ToList();

        return Result<ProjectQuestionStatsDto>.Ok(new ProjectQuestionStatsDto
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            TotalQuestions = questions.Count,
            From = from,
            To = to,
            Categories = categories,
            UncategorizedQuestions = uncategorized
        });
    }
}
