using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Sectors;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des secteurs d'activité.
/// Lectures publiques (site vitrine) + CRUD réservé au dashboard.
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

    /* ============ ROUTES PUBLIQUES (site vitrine) ============ */

    /// <summary>
    /// Secteurs actifs uniquement, triés par ordre d'affichage.
    /// GET /api/sectors — utilisé par le site vitrine.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var result = await _sectorService.GetActiveAsync();
        return Ok(result.Data);
    }

    /// <summary>
    /// Secteur par son slug.
    /// GET /api/sectors/automobile — utilisé par /realisations/automobile.
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

    /* ============ ROUTES DASHBOARD (protégées) ============ */

    /// <summary>
    /// Tous les secteurs, même inactifs (dashboard).
    /// GET /api/sectors/all
    /// </summary>
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sectorService.GetAllAsync();
        return Ok(result.Data);
    }

    /// <summary>Secteur par Id (dashboard). GET /api/sectors/by-id/{id}</summary>
    [HttpGet("by-id/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _sectorService.GetByIdAsync(id);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Crée un secteur (dashboard). POST /api/sectors</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateSectorDto dto)
    {
        var result = await _sectorService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Modifie un secteur (dashboard). PUT /api/sectors/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSectorDto dto)
    {
        var result = await _sectorService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Supprime un secteur (dashboard). DELETE /api/sectors/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _sectorService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Secteur supprimé." });
    }
}