using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Contacts;

namespace Signature3D.Application.Interfaces;

public interface IContactService
{
    Task<Result<List<ContactDto>>> GetByClientAsync(Guid clientId);
    Task<Result<ContactDto>> CreateAsync(Guid clientId, CreateContactDto dto);
    Task<Result<ContactDto>> UpdateAsync(Guid id, UpdateContactDto dto);
    Task<Result> DeleteAsync(Guid id);
}
