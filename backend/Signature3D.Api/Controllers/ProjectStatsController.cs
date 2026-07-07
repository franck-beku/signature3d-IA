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

    /// <summary>
    /// Retourne les statistiques de visites tous projets confondus — utilisé par la vue globale du dashboard.
    /// GET /api/stats/visits/total?from=&amp;to=
    /// </summary>
    [HttpGet("visits/total")]
    public async Task<IActionResult> GetGlobalVisitStats([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _statsService.GetGlobalVisitStatsAsync(from, to);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne le nombre de clics par bouton d'action d'un projet, trié du plus cliqué au moins cliqué.
    /// GET /api/stats/project/{projectId}/button-clicks?from=&amp;to=
    /// Regroupement par libellé de bouton (pas de lien ProjectButtonId aujourd'hui — voir ButtonClickStatsDto).
    /// </summary>
    [HttpGet("project/{projectId:guid}/button-clicks")]
    public async Task<IActionResult> GetButtonClickStats(Guid projectId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _statsService.GetButtonClickStatsAsync(projectId, from, to);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne les statistiques de leads d'un projet (total, 30 derniers jours, découpage par statut).
    /// GET /api/stats/project/{projectId}/leads?from=&amp;to=
    /// </summary>
    [HttpGet("project/{projectId:guid}/leads")]
    public async Task<IActionResult> GetLeadStats(Guid projectId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _statsService.GetLeadStatsAsync(projectId, from, to);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne les questions visiteur posées à Luxedia, regroupées par catégorie métier (FR/EN).
    /// GET /api/stats/project/{projectId}/questions?from=&amp;to=
    /// </summary>
    [HttpGet("project/{projectId:guid}/questions")]
    public async Task<IActionResult> GetLuxediaQuestionStats(Guid projectId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _statsService.GetLuxediaQuestionStatsAsync(projectId, from, to);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }
}
