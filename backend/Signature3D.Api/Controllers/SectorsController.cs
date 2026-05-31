using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des secteurs d'activité.
/// Les secteurs apparaissent automatiquement sur le site vitrine dans /realisations.
/// Route : /api/sectors
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SectorsController : ControllerBase
{
    private readonly ISectorService _sectorService;

    public SectorsController(ISectorService sectorService)
    {
        _sectorService = sectorService;
    }

    /// <summary>
    /// Retourne tous les secteurs avec le nombre de clients.
    /// GET /api/sectors
    /// Public — utilisé par le site vitrine pour afficher les réalisations.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sectorService.GetAllAsync();
        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne un secteur par son slug.
    /// GET /api/sectors/automobile
    /// Public — utilisé par /realisations/automobile sur le site vitrine.
    /// </summary>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _sectorService.GetBySlugAsync(slug);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }
}