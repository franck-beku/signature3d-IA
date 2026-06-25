using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Contacts;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

public class ContactService : IContactService
{
    private readonly AppDbContext _db;

    public ContactService(AppDbContext db) => _db = db;

    public async Task<Result<List<ContactDto>>> GetByClientAsync(Guid clientId)
    {
        var contacts = await _db.Contacts
            .Where(c => c.ClientId == clientId)
            .OrderByDescending(c => c.IsPrimary)
            .ThenBy(c => c.Name)
            .Select(c => ToDto(c))
            .ToListAsync();

        return Result<List<ContactDto>>.Ok(contacts);
    }

    public async Task<Result<ContactDto>> CreateAsync(Guid clientId, CreateContactDto dto)
    {
        var clientExists = await _db.Clients.AnyAsync(c => c.Id == clientId);
        if (!clientExists)
            return Result<ContactDto>.Fail("Client introuvable.");

        var contact = new Contact
        {
            ClientId       = clientId,
            Name           = dto.Name,
            Position       = dto.Position,
            Email          = dto.Email,
            Phone          = dto.Phone,
            PhoneExtension = dto.PhoneExtension,
            IsPrimary      = dto.IsPrimary,
        };

        _db.Contacts.Add(contact);
        await _db.SaveChangesAsync();

        return Result<ContactDto>.Ok(ToDto(contact));
    }

    public async Task<Result<ContactDto>> UpdateAsync(Guid id, UpdateContactDto dto)
    {
        var contact = await _db.Contacts.FindAsync(id);
        if (contact is null)
            return Result<ContactDto>.Fail("Contact introuvable.");

        if (dto.Name           is not null) contact.Name           = dto.Name;
        if (dto.Position       is not null) contact.Position       = dto.Position;
        if (dto.Email          is not null) contact.Email          = dto.Email;
        if (dto.Phone          is not null) contact.Phone          = dto.Phone;
        if (dto.PhoneExtension is not null) contact.PhoneExtension = dto.PhoneExtension;
        if (dto.IsPrimary      is not null) contact.IsPrimary      = dto.IsPrimary.Value;

        contact.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result<ContactDto>.Ok(ToDto(contact));
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var contact = await _db.Contacts.FindAsync(id);
        if (contact is null)
            return Result.Fail("Contact introuvable.");

        _db.Contacts.Remove(contact);
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    private static ContactDto ToDto(Contact c) => new()
    {
        Id             = c.Id,
        ClientId       = c.ClientId,
        Name           = c.Name,
        Position       = c.Position,
        Email          = c.Email,
        Phone          = c.Phone,
        PhoneExtension = c.PhoneExtension,
        IsPrimary      = c.IsPrimary,
    };
}
