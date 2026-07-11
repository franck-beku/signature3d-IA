using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Testimonials;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des témoignages clients.
/// Lecture publique + CRUD réservé au dashboard.
/// Route : /api/testimonials
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TestimonialsController : ControllerBase
{
    private readonly ITestimonialService _testimonialService;

    public TestimonialsController(ITestimonialService testimonialService)
    {
        _testimonialService = testimonialService;
    }

    /* ============ ROUTE PUBLIQUE ============ */

    /// <summary>Témoignages publiés, triés. GET /api/testimonials/published — site vitrine.</summary>
    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished()
    {
        var result = await _testimonialService.GetPublishedAsync();
        return Ok(result.Data);
    }

    /* ============ ROUTES DASHBOARD (protégées) ============ */

    /// <summary>Tous les témoignages, même non publiés. GET /api/testimonials/all</summary>
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var result = await _testimonialService.GetAllAsync();
        return Ok(result.Data);
    }

    /// <summary>Témoignage par Id. GET /api/testimonials/by-id/{id}</summary>
    [HttpGet("by-id/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _testimonialService.GetByIdAsync(id);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Crée un témoignage. POST /api/testimonials</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateTestimonialDto dto)
    {
        var result = await _testimonialService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Modifie un témoignage. PUT /api/testimonials/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestimonialDto dto)
    {
        var result = await _testimonialService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Supprime un témoignage. DELETE /api/testimonials/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _testimonialService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Témoignage supprimé." });
    }
}
