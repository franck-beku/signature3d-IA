using Microsoft.EntityFrameworkCore;
using Signature3D.Application.DTOs.Timeline;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

public class TimelineService : ITimelineService
{
    private readonly AppDbContext _db;

    public TimelineService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<TimelineItemDto>?> GetClientTimelineAsync(Guid clientId)
    {
        var client = await _db.Clients.FindAsync(clientId);
        if (client is null) return null;

        var items = new List<TimelineItemDto>();
        items.AddRange(CollectClientMoments(client));
        items.AddRange(await CollectContactMoments(clientId));
        items.AddRange(await CollectProjectMoments(clientId));
        items.AddRange(await CollectAgendaMoments(clientId));
        items.AddRange(await CollectLeadMoments(clientId));

        return items.OrderBy(i => i.Date);
    }

    // ── Collecteurs ────────────────────────────────────────────────

    private static IEnumerable<TimelineItemDto> CollectClientMoments(Client client)
    {
        yield return new TimelineItemDto
        {
            Date  = client.CreatedAt,
            Type  = nameof(TimelineEventType.ClientCree),
            Title = "Dossier client créé",
        };

        // ContractDate/DeliveryDate sont désormais nullables (Prospect sans contrat) —
        // aucune fausse date n'est inventée : l'événement n'existe simplement pas encore.
        if (client.ContractDate.HasValue)
        {
            yield return new TimelineItemDto
            {
                Date  = client.ContractDate.Value,
                Type  = nameof(TimelineEventType.ContratSigne),
                Title = "Contrat signé",
            };
        }
        if (client.DeliveryDate.HasValue)
        {
            yield return new TimelineItemDto
            {
                Date  = client.DeliveryDate.Value,
                Type  = nameof(TimelineEventType.LivraisonPrevue),
                Title = "Livraison prévue",
            };
        }
    }

    private async Task<IEnumerable<TimelineItemDto>> CollectContactMoments(Guid clientId)
    {
        var contacts = await _db.Contacts
            .Where(c => c.ClientId == clientId)
            .ToListAsync();

        return contacts.Select(c => new TimelineItemDto
        {
            Date  = c.CreatedAt,
            Type  = nameof(TimelineEventType.ContactAjoute),
            Title = $"Contact ajouté : {c.Name}",
        });
    }

    private async Task<IEnumerable<TimelineItemDto>> CollectProjectMoments(Guid clientId)
    {
        var projects = await _db.Projects
            .Where(p => p.ClientId == clientId)
            .ToListAsync();

        var items = new List<TimelineItemDto>();
        foreach (var p in projects)
        {
            items.Add(new TimelineItemDto
            {
                Date        = p.CreatedAt,
                Type        = nameof(TimelineEventType.ProjetCree),
                Title       = $"Projet créé : {p.Name}",
                ProjectId   = p.Id,
                ProjectName = p.Name,
            });

            if (p.PublishedAt.HasValue)
            {
                items.Add(new TimelineItemDto
                {
                    Date        = p.PublishedAt.Value,
                    Type        = nameof(TimelineEventType.ProjetPublie),
                    Title       = $"Projet publié : {p.Name}",
                    ProjectId   = p.Id,
                    ProjectName = p.Name,
                });
            }
        }
        return items;
    }

    private async Task<IEnumerable<TimelineItemDto>> CollectAgendaMoments(Guid clientId)
    {
        var events = await _db.AgendaEvents
            .Where(e => e.ClientId == clientId)
            .ToListAsync();

        return events.Select(e => new TimelineItemDto
        {
            Date        = e.StartDateTime,
            Type        = nameof(TimelineEventType.EvenementAgenda),
            Title       = e.Title,
            Description = e.Type.ToString(),
            ProjectId   = e.ProjectId,
        });
    }

    private async Task<IEnumerable<TimelineItemDto>> CollectLeadMoments(Guid clientId)
    {
        var projectIds = await _db.Projects
            .Where(p => p.ClientId == clientId)
            .Select(p => p.Id)
            .ToListAsync();

        if (projectIds.Count == 0) return [];

        var firstLead = await _db.Leads
            .Where(l => l.ProjectId.HasValue && projectIds.Contains(l.ProjectId!.Value))
            .OrderBy(l => l.CreatedAt)
            .FirstOrDefaultAsync();

        if (firstLead is null) return [];

        return [new TimelineItemDto
        {
            Date  = firstLead.CreatedAt,
            Type  = nameof(TimelineEventType.PremierLead),
            Title = "Premier lead reçu",
        }];
    }
}
