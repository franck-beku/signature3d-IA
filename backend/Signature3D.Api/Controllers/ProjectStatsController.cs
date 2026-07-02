using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de reporting client — expose les métriques de preuve (visites, clics par bouton,
/// leads, questions Luxedia) utilisées par le rapport dashboard/PDF.
/// Toutes les routes sont authentifiées (consultées depuis le dashboard, jamais depuis l'embed public).
/// Route : /api/stats
/// </summary>
[ApiController]
[Route("api/stats")]
[Authorize]
public class ProjectStatsController : ControllerBase
{
    private readonly IProjectStatsService _statsService;

    public ProjectStatsController(IProjectStatsService statsService)
    {
        _statsService = statsService;
    }

    /// <summary>
    /// Retourne les statistiques de visites d'un projet.
    /// GET /api/stats/project/{projectId}/visits?from=&amp;to=
    /// from/to optionnels (format ISO 8601) — filtrent le total ; "Last30Days" reste un repère fixe.
    /// </summary>
    [HttpGet("project/{projectId:guid}/visits")]
    public async Task<IActionResult> GetVisitStats(Guid projectId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _statsService.GetVisitStatsAsync(projectId, from, to);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }
}
