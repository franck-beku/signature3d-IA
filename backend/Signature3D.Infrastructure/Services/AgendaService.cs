using Microsoft.EntityFrameworkCore;
using Signature3D.Application.DTOs.Agenda;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

public class AgendaService : IAgendaService
{
    private readonly AppDbContext _db;

    public AgendaService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<AgendaEventDto>> GetAllAsync(
        Guid? clientId = null,
        Guid? projectId = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        var query = _db.AgendaEvents
            .Include(e => e.Client)
            .Include(e => e.Project)
            .Include(e => e.Contact)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(e => e.ClientId == clientId);
        if (projectId.HasValue)
            query = query.Where(e => e.ProjectId == projectId);
        if (from.HasValue)
            query = query.Where(e => e.StartDateTime >= from.Value);
        if (to.HasValue)
            query = query.Where(e => e.StartDateTime <= to.Value);

        var events = await query.OrderBy(e => e.StartDateTime).ToListAsync();
        return events.Select(Map);
    }

    public async Task<AgendaEventDto?> GetByIdAsync(Guid id)
    {
        var e = await _db.AgendaEvents
            .Include(e => e.Client)
            .Include(e => e.Project)
            .Include(e => e.Contact)
            .FirstOrDefaultAsync(e => e.Id == id);

        return e is null ? null : Map(e);
    }

    public async Task<AgendaEventDto> CreateAsync(CreateAgendaEventDto dto)
    {
        if (!Enum.TryParse<EventType>(dto.Type, out var eventType))
            throw new ArgumentException($"Type d'événement invalide : '{dto.Type}'.");

        var e = new AgendaEvent
        {
            Title = dto.Title,
            StartDateTime = dto.StartDateTime,
            EndDateTime = dto.EndDateTime,
            Type = eventType,
            Location = dto.Location,
            Notes = dto.Notes,
            ClientId = dto.ClientId,
            ProjectId = dto.ProjectId,
            ContactId = dto.ContactId
        };

        _db.AgendaEvents.Add(e);
        await _db.SaveChangesAsync();

        await _db.Entry(e).Reference(x => x.Client).LoadAsync();
        await _db.Entry(e).Reference(x => x.Project).LoadAsync();
        await _db.Entry(e).Reference(x => x.Contact).LoadAsync();

        return Map(e);
    }

    public async Task<AgendaEventDto?> UpdateAsync(Guid id, UpdateAgendaEventDto dto)
    {
        var e = await _db.AgendaEvents.FindAsync(id);
        if (e is null) return null;

        if (!Enum.TryParse<EventType>(dto.Type, out var eventType))
            throw new ArgumentException($"Type d'événement invalide : '{dto.Type}'.");

        e.Title = dto.Title;
        e.StartDateTime = dto.StartDateTime;
        e.EndDateTime = dto.EndDateTime;
        e.Type = eventType;
        e.Location = dto.Location;
        e.Notes = dto.Notes;
        e.ClientId = dto.ClientId;
        e.ProjectId = dto.ProjectId;
        e.ContactId = dto.ContactId;
        e.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _db.Entry(e).Reference(x => x.Client).LoadAsync();
        await _db.Entry(e).Reference(x => x.Project).LoadAsync();
        await _db.Entry(e).Reference(x => x.Contact).LoadAsync();

        return Map(e);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var e = await _db.AgendaEvents.FindAsync(id);
        if (e is null) return false;

        _db.AgendaEvents.Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }

    private static AgendaEventDto Map(AgendaEvent e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        StartDateTime = e.StartDateTime,
        EndDateTime = e.EndDateTime,
        Type = e.Type.ToString(),
        Location = e.Location,
        Notes = e.Notes,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,
        ClientId = e.ClientId,
        ClientName = e.Client?.Name,
        ProjectId = e.ProjectId,
        ProjectName = e.Project?.Name,
        ContactId = e.ContactId,
        ContactName = e.Contact?.Name
    };
}
