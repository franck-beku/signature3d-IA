using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Analytics;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service d'analytics — visites, leads, interactions, QR scans.
/// </summary>
public interface IAnalyticsService
{
    Task<Result<ProjectAnalyticsDto>> GetByProjectAsync(Guid projectId);
    Task<Result> TrackEventAsync(TrackEventDto dto);
}