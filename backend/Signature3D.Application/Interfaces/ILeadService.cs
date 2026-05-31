using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Leads;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des leads générés par les visiteurs.
/// </summary>
public interface ILeadService
{
    Task<Result<PagedResult<LeadDto>>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<Result<List<LeadDto>>> GetByProjectAsync(Guid projectId);
    Task<Result<LeadDto>> CreateAsync(CreateLeadDto dto);
    Task<Result> UpdateStatusAsync(Guid id, string status);
}