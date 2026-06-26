using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Agenda;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

[ApiController]
[Route("api/agenda")]
[Authorize]
public class AgendaController : ControllerBase
{
    private readonly IAgendaService _agenda;

    public AgendaController(IAgendaService agenda) => _agenda = agenda;

    // GET /api/agenda?clientId=&projectId=&from=&to=
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? projectId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var result = await _agenda.GetAllAsync(clientId, projectId, from, to);
        return Ok(result);
    }

    // GET /api/agenda/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _agenda.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST /api/agenda
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAgendaEventDto dto)
    {
        try
        {
            var result = await _agenda.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/agenda/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAgendaEventDto dto)
    {
        try
        {
            var result = await _agenda.UpdateAsync(id, dto);
            return result is null ? NotFound() : Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/agenda/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _agenda.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
