using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller des QR codes.
/// Génère et gère les QR codes avec logo Signature 3D IA.
/// Route : /api/qrcodes
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class QrCodesController : ControllerBase
{
    private readonly IQrCodeService _qrCodeService;

    public QrCodesController(IQrCodeService qrCodeService)
    {
        _qrCodeService = qrCodeService;
    }

    /// <summary>
    /// Génère un QR code pour un projet.
    /// POST /api/qrcodes/generate/{projectId}
    /// Requiert authentification — Alain ou Franck uniquement.
    /// </summary>
    [HttpPost("generate/{projectId:guid}")]
    [Authorize]
    public async Task<IActionResult> Generate(Guid projectId)
    {
        var result = await _qrCodeService.GenerateAsync(projectId);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Enregistre un scan de QR code.
    /// POST /api/qrcodes/scan/{projectId}
    /// Public — appelé automatiquement quand quelqu'un scanne le QR.
    /// </summary>
    [HttpPost("scan/{projectId:guid}")]
    public async Task<IActionResult> TrackScan(Guid projectId)
    {
        var result = await _qrCodeService.TrackScanAsync(projectId);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok();
    }
}