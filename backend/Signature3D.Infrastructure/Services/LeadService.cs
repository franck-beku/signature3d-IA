using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Leads;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des leads.
/// Enregistre les leads soumis par les visiteurs depuis l'embed OU le site public,
/// puis envoie une notification email (sans jamais faire échouer la création du lead).
/// </summary>
public class LeadService : ILeadService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly ResendSettings _resend;
    private readonly ILogger<LeadService> _logger;

    public LeadService(
        AppDbContext db,
        IEmailService email,
        ResendSettings resend,
        ILogger<LeadService> logger)
    {
        _db = db;
        _email = email;
        _resend = resend;
        _logger = logger;
    }

    /// <summary>Retourne tous les leads paginés pour le dashboard.</summary>
    public async Task<Result<PagedResult<LeadDto>>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        // ⚠ Project peut être null (lead « contact général ») → Include reste sûr,
        // EF gère les jointures optionnelles.
        var query = _db.Leads
            .Include(l => l.Project!).ThenInclude(p => p.Client)
            .OrderByDescending(l => l.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Result<PagedResult<LeadDto>>.Ok(new PagedResult<LeadDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>Retourne les leads d'un projet spécifique.</summary>
    public async Task<Result<List<LeadDto>>> GetByProjectAsync(Guid projectId)
    {
        var leads = await _db.Leads
            .Include(l => l.Project!).ThenInclude(p => p.Client)
            .Where(l => l.ProjectId == projectId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Result<List<LeadDto>>.Ok(leads.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Crée un nouveau lead (embed avec projet, OU site public sans projet)
    /// puis envoie une notification email.
    /// </summary>
    public async Task<Result<LeadDto>> CreateAsync(CreateLeadDto dto)
    {
        // 0) Validation serveur — tous les champs restent optionnels (null/vide/whitespace
        //    accepté sans erreur) ; seule une valeur RÉELLEMENT fournie est contrôlée en
        //    longueur, et l'email en plus en format. Jamais de troncature silencieuse :
        //    une valeur trop longue est refusée, pas coupée.
        if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name.Length > 200)
            return Result<LeadDto>.Fail("Le nom dépasse la longueur maximale autorisée (200 caractères).");

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            if (dto.Email.Length > 254)
                return Result<LeadDto>.Fail("L'adresse courriel dépasse la longueur maximale autorisée (254 caractères).");
            if (!IsValidEmail(dto.Email))
                return Result<LeadDto>.Fail("L'adresse courriel n'est pas valide.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Phone) && dto.Phone.Length > 30)
            return Result<LeadDto>.Fail("Le numéro de téléphone dépasse la longueur maximale autorisée (30 caractères).");

        if (!string.IsNullOrWhiteSpace(dto.Message) && dto.Message.Length > 5000)
            return Result<LeadDto>.Fail("Le message dépasse la longueur maximale autorisée (5000 caractères).");

        if (dto.ButtonLabel.Length > 200)
            return Result<LeadDto>.Fail("Le libellé du bouton dépasse la longueur maximale autorisée (200 caractères).");

        // 1) Résoudre le projet SEULEMENT si un ProjectId est fourni.
        Project? project = null;

        if (dto.ProjectId is Guid projectId)
        {
            project = await _db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            // ProjectId fourni mais introuvable → vraie erreur.
            if (project is null)
                return Result<LeadDto>.Fail("Projet introuvable.");
        }

        // 2) Créer et sauvegarder le lead (source de vérité).
        var lead = new Lead
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Message = dto.Message,
            ButtonLabel = dto.ButtonLabel,
            Status = LeadStatus.Nouveau,
            ProjectId = project?.Id   // null pour un lead « contact général »
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        // 3) Notification email — APRÈS le save, et isolée :
        //    un échec d'email ne doit JAMAIS faire échouer la création du lead.
        await TrySendNotificationAsync(lead, project, dto);

        // 4) Recharger la relation (peut rester null pour un lead général).
        if (lead.ProjectId is not null)
        {
            await _db.Entry(lead).Reference(l => l.Project!).LoadAsync();
            if (lead.Project is not null)
                await _db.Entry(lead.Project).Reference(p => p.Client).LoadAsync();
        }

        return Result<LeadDto>.Ok(MapToDto(lead));
    }

    /// <summary>
    /// Choisit les destinataires et envoie la notification, sans propager d'erreur.
    /// - Lead de PROJET : on garde le LeadEmail du projet s'il existe.
    /// - Lead du SITE (sans projet) : on envoie aux destinataires configurés (Franck + Alain).
    /// </summary>
    private async Task TrySendNotificationAsync(Lead lead, Project? project, CreateLeadDto dto)
    {
        try
        {
            List<string> recipients;
            string projectName;

            if (project is not null)
            {
                projectName = project.Name;
                recipients = !string.IsNullOrWhiteSpace(project.LeadEmail)
                    ? new List<string> { project.LeadEmail }
                    : _resend.NotificationRecipients;   // repli si le projet n'a pas d'email
            }
            else
            {
                projectName = "Contact général";
                recipients = _resend.NotificationRecipients;
            }

            if (recipients.Count == 0)
            {
                _logger.LogWarning("Lead {LeadId} : aucun destinataire configuré, notification ignorée.", lead.Id);
                return;
            }

            // Contact = courriel si présent, sinon téléphone.
            var leadContact = !string.IsNullOrWhiteSpace(dto.Email) ? dto.Email : dto.Phone;

            await _email.SendLeadNotificationAsync(
                recipients,
                projectName,
                dto.Name ?? "Visiteur",
                leadContact,
                string.IsNullOrWhiteSpace(dto.Message) ? dto.ButtonLabel : dto.Message);
        }
        catch (Exception ex)
        {
            // Filet de sécurité ultime : le lead est déjà en base, on log et on continue.
            _logger.LogError(ex, "Lead {LeadId} : échec de l'envoi de la notification email.", lead.Id);
        }
    }

    /// <summary>Met à jour le statut d'un lead (Nouveau, Contacté, Converti, Perdu).</summary>
    public async Task<Result> UpdateStatusAsync(Guid id, string status)
    {
        var lead = await _db.Leads.FindAsync(id);
        if (lead is null)
            return Result.Fail("Lead introuvable.");

        if (!Enum.TryParse<LeadStatus>(status, out var leadStatus))
            return Result.Fail("Statut invalide.");

        lead.Status = leadStatus;
        lead.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>Validation de forme uniquement — s'appuie sur le parseur .NET existant,
    /// aucune nouvelle dépendance.</summary>
    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new System.Net.Mail.MailAddress(email);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static LeadDto MapToDto(Lead l) => new()
    {
        Id = l.Id,
        Name = l.Name,
        Email = l.Email,
        Phone = l.Phone,
        Message = l.Message,
        ButtonLabel = l.ButtonLabel,
        Status = l.Status.ToString(),
        // Lead « contact général » : pas de projet → libellé clair pour le dashboard.
        ProjectName = l.Project?.Name ?? "Contact général",
        ClientName = l.Project?.Client?.Name ?? string.Empty,
        CreatedAt = l.CreatedAt
    };
}