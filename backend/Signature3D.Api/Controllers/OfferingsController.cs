using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Offerings;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des offres commerciales (Offerings).
/// Affichées sur le site comme "Nos services / Nos solutions".
/// Lectures publiques + CRUD réservé au dashboard.
/// Route : /api/offerings
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class OfferingsController : ControllerBase
{
    private readonly IOfferingService _offeringService;

    public OfferingsController(IOfferingService offeringService)
    {
        _offeringService = offeringService;
    }

    /* ============ ROUTES PUBLIQUES ============ */

    /// <summary>Offres actives, triées. GET /api/offerings — site vitrine.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var result = await _offeringService.GetActiveAsync();
        return Ok(result.Data);
    }

    /// <summary>Offre par slug. GET /api/offerings/matterport-ia</summary>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _offeringService.GetBySlugAsync(slug);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /* ============ ROUTES DASHBOARD (protégées) ============ */

    /// <summary>Toutes les offres, même inactives. GET /api/offerings/all</summary>
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var result = await _offeringService.GetAllAsync();
        return Ok(result.Data);
    }

    /// <summary>Offre par Id. GET /api/offerings/by-id/{id}</summary>
    [HttpGet("by-id/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _offeringService.GetByIdAsync(id);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Crée une offre. POST /api/offerings</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateOfferingDto dto)
    {
        var result = await _offeringService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Modifie une offre. PUT /api/offerings/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOfferingDto dto)
    {
        var result = await _offeringService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Supprime une offre. DELETE /api/offerings/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _offeringService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Offre supprimée." });
    }
}