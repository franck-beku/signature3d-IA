using Signature3D.Application.DTOs.Agenda;

namespace Signature3D.Application.Interfaces;

public interface IAgendaService
{
    Task<IEnumerable<AgendaEventDto>> GetAllAsync(
        Guid? clientId = null,
        Guid? projectId = null,
        DateTime? from = null,
        DateTime? to = null);

    Task<AgendaEventDto?> GetByIdAsync(Guid id);
    Task<AgendaEventDto> CreateAsync(CreateAgendaEventDto dto);
    Task<AgendaEventDto?> UpdateAsync(Guid id, UpdateAgendaEventDto dto);
    Task<bool> DeleteAsync(Guid id);
}
