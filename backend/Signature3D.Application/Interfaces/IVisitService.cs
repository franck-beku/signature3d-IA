using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Visits;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de tracking des visites sur les expériences embed.
/// </summary>
public interface IVisitService
{
    Task<Result<VisitDto>> CreateAsync(CreateVisitDto dto);
    Task<Result> UpdateDurationAsync(Guid visitId, int durationSeconds);
}