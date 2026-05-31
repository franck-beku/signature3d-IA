using Microsoft.AspNetCore.Http;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Clients;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de gestion des clients du dashboard.
/// </summary>
public interface IClientService
{
    Task<Result<PagedResult<ClientDto>>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<Result<ClientDto>> GetBySlugAsync(string slug);
    Task<Result<ClientDto>> CreateAsync(CreateClientDto dto);
    Task<Result<ClientDto>> UpdateAsync(Guid id, UpdateClientDto dto);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<ClientDto>> UploadContractAsync(Guid id, IFormFile file);
}