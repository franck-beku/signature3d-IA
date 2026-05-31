using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Projects;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des projets.
/// Crée les expériences Matterport+IA ou IA seule.
/// Route : /api/projects
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Retourne tous les projets d'un client.
    /// GET /api/projects/client/{clientId}
    /// </summary>
    [HttpGet("client/{clientId:guid}")]
    public async Task<IActionResult> GetByClient(Guid clientId)
    {
        var result = await _projectService.GetByClientAsync(clientId);
        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne un projet par son slug — utilisé par l'embed.
    /// GET /api/projects/slug/{slug}
    /// Endpoint public — pas besoin d'authentification.
    /// </summary>
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _projectService.GetBySlugAsync(slug);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Crée un nouveau projet depuis le dashboard.
    /// POST /api/projects
    /// Body : { "name": "Mercedes CLE 53", "matterportId": "abc123", "clientId": "..." }
    /// Si matterportId est vide → projet IA seule.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var result = await _projectService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetBySlug),
            new { slug = result.Data!.Slug },
            result.Data);
    }

    /// <summary>
    /// Modifie un projet — nom, Matterport ID, boutons configurables.
    /// PUT /api/projects/{id}
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
    {
        var result = await _projectService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Supprime un projet et toutes ses données.
    /// DELETE /api/projects/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _projectService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }
}