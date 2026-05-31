using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Projects;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des projets (Matterport + IA ou IA seule).
/// </summary>
public interface IProjectService
{
    Task<Result<List<ProjectDto>>> GetByClientAsync(Guid clientId);
    Task<Result<ProjectDto>> GetBySlugAsync(string slug);
    Task<Result<ProjectDto>> CreateAsync(CreateProjectDto dto);
    Task<Result<ProjectDto>> UpdateAsync(Guid id, UpdateProjectDto dto);
    Task<Result> DeleteAsync(Guid id);
}