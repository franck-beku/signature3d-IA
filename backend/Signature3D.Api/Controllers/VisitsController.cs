using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Visits;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de tracking des visites.
/// Enregistre chaque visite sur une expérience embed.
/// Route : /api/visits
/// Public — les visiteurs n'ont pas besoin de s'authentifier.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    /// <summary>
    /// Enregistre une nouvelle visite sur un projet.
    /// POST /api/visits
    /// Body : { "projectSlug": "mercedes-cle", "source": "QrCode" }
    /// Appelé automatiquement quand un visiteur ouvre une expérience.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVisitDto dto)
    {
        // Récupérer le user agent depuis les headers HTTP
        dto.UserAgent = Request.Headers.UserAgent.ToString();

        var result = await _visitService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Met à jour la durée d'une visite quand le visiteur quitte.
    /// PATCH /api/visits/{id}/duration
    /// Body : { "durationSeconds": 120 }
    /// </summary>
    [HttpPatch("{id:guid}/duration")]
    public async Task<IActionResult> UpdateDuration(Guid id, [FromBody] UpdateDurationDto dto)
    {
        var result = await _visitService.UpdateDurationAsync(id, dto.DurationSeconds);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok();
    }
}

/// <summary>DTO pour mettre à jour la durée d'une visite.</summary>
public record UpdateDurationDto(int DurationSeconds);