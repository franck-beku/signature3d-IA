using Signature3D.Application.DTOs.Timeline;

namespace Signature3D.Application.Interfaces;

public interface ITimelineService
{
    Task<IEnumerable<TimelineItemDto>?> GetClientTimelineAsync(Guid clientId);
}
