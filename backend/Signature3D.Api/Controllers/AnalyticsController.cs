using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Analytics;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller des analytics.
/// Fournit les statistiques pour les graphiques du dashboard.
/// Route : /api/analytics
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Retourne les statistiques complètes d'un projet.
    /// GET /api/analytics/project/{projectId}
    /// </summary>
    [HttpGet("project/{projectId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _analyticsService.GetByProjectAsync(projectId);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Enregistre un événement analytics depuis l'embed.
    /// POST /api/analytics/track
    /// Public — appelé automatiquement par l'interface embed.
    /// Ex: { "eventType": "ButtonClick", "projectSlug": "mercedes-cle", "metadata": "Réserver un essai" }
    /// </summary>
    [HttpPost("track")]
    public async Task<IActionResult> Track([FromBody] TrackEventDto dto)
    {
        var result = await _analyticsService.TrackEventAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok();
    }
}