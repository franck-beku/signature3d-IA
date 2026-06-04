using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Faqs;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des questions fréquentes (FAQ).
/// Lecture publique + CRUD réservé au dashboard.
/// Route : /api/faq
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class FaqController : ControllerBase
{
    private readonly IFaqService _faqService;

    public FaqController(IFaqService faqService)
    {
        _faqService = faqService;
    }

    /* ============ ROUTE PUBLIQUE ============ */

    /// <summary>FAQ publiées, triées. GET /api/faq — site vitrine.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished()
    {
        var result = await _faqService.GetPublishedAsync();
        return Ok(result.Data);
    }

    /* ============ ROUTES DASHBOARD (protégées) ============ */

    /// <summary>Toutes les FAQ, même non publiées. GET /api/faq/all</summary>
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var result = await _faqService.GetAllAsync();
        return Ok(result.Data);
    }

    /// <summary>FAQ par Id. GET /api/faq/by-id/{id}</summary>
    [HttpGet("by-id/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _faqService.GetByIdAsync(id);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Crée une FAQ. POST /api/faq</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateFaqDto dto)
    {
        var result = await _faqService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Modifie une FAQ. PUT /api/faq/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFaqDto dto)
    {
        var result = await _faqService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Supprime une FAQ. DELETE /api/faq/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _faqService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "FAQ supprimée." });
    }
}