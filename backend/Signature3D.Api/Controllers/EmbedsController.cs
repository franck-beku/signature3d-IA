using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de l'interface embed.
/// Public — accessible par tous les visiteurs sans authentification.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmbedsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IVisitService _visitService;
    private readonly IQrCodeService _qrCodeService;

    public EmbedsController(
        IProjectService projectService,
        IVisitService visitService,
        IQrCodeService qrCodeService)
    {
        _projectService = projectService;
        _visitService   = visitService;
        _qrCodeService  = qrCodeService;
    }

    /// <summary>
    /// Retourne les données complètes d'une expérience embed.
    /// GET /api/embeds/{slug}
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetEmbed(string slug)
    {
        var result = await _projectService.GetBySlugAsync(slug);

        if (!result.Success)
            return NotFound(new { message = "Expérience introuvable." });

        var project = result.Data!;

        return Ok(new
        {
            projectId      = project.Id,        // ← ajouté pour les leads
            slug           = project.Slug,
            projectName    = project.Name,
            matterportId   = project.MatterportId ?? string.Empty,
            ambassadorName = project.AmbassadorName,
            welcomeMessage = project.WelcomeMessage,
            buttons        = project.Buttons,
            embedUrl       = project.EmbedUrl,
        });
    }

    /// <summary>
    /// Enregistre l'ouverture d'une expérience via QR code.
    /// POST /api/embeds/{slug}/qr-scan
    /// </summary>
    [HttpPost("{slug}/qr-scan")]
    public async Task<IActionResult> TrackQrScan(string slug)
    {
        var projectResult = await _projectService.GetBySlugAsync(slug);
        if (!projectResult.Success)
            return NotFound();

        await _qrCodeService.TrackScanAsync(projectResult.Data!.Id);

        return Ok();
    }
}