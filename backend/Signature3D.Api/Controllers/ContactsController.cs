using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Contacts;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

[ApiController]
[Route("api/contacts")]
[Authorize]
public class ContactsController : ControllerBase
{
    private readonly IContactService _contacts;

    public ContactsController(IContactService contacts) => _contacts = contacts;

    // GET /api/contacts/client/{clientId}
    [HttpGet("client/{clientId:guid}")]
    public async Task<IActionResult> GetByClient(Guid clientId)
    {
        var result = await _contacts.GetByClientAsync(clientId);
        return Ok(result.Data);
    }

    // POST /api/contacts/client/{clientId}
    [HttpPost("client/{clientId:guid}")]
    public async Task<IActionResult> Create(Guid clientId, [FromBody] CreateContactDto dto)
    {
        var result = await _contacts.CreateAsync(clientId, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetByClient),
            new { clientId = result.Data!.ClientId },
            result.Data);
    }

    // PUT /api/contacts/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContactDto dto)
    {
        var result = await _contacts.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    // DELETE /api/contacts/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _contacts.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }
}
