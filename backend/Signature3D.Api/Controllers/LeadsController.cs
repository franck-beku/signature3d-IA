using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Leads;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des leads.
/// Les leads sont créés par les visiteurs depuis l'embed.
/// Route : /api/leads
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Retourne tous les leads paginés — dashboard uniquement.
    /// GET /api/leads?page=1&pageSize=20
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _leadService.GetAllAsync(page, pageSize);
        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne les leads d'un projet spécifique.
    /// GET /api/leads/project/{projectId}
    /// </summary>
    [HttpGet("project/{projectId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _leadService.GetByProjectAsync(projectId);
        return Ok(result.Data);
    }

    /// <summary>
    /// Crée un nouveau lead depuis l'interface embed.
    /// POST /api/leads
    /// Public — appelé par les visiteurs qui cliquent sur un bouton d'action.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeadDto dto)
    {
        var result = await _leadService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(null, null, result.Data);
    }

    /// <summary>
    /// Met à jour le statut d'un lead (Nouveau, Contacté, Converti, Perdu).
    /// PATCH /api/leads/{id}/status
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeadStatusDto dto)
    {
        var result = await _leadService.UpdateStatusAsync(id, dto.Status);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Statut mis à jour." });
    }
}

/// <summary>DTO pour mettre à jour le statut d'un lead.</summary>
public record UpdateLeadStatusDto(string Status);