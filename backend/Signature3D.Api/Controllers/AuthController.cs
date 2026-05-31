using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Auth;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller d'authentification.
/// Gère la connexion d'Alain et Franck au dashboard.
/// Route : /api/auth
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Connecte un utilisateur et retourne un token JWT.
    /// POST /api/auth/login
    /// Body : { "email": "alain@signature3d.ai", "password": "..." }
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (!result.Success)
            return Unauthorized(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Change le mot de passe de l'utilisateur connecté.
    /// POST /api/auth/change-password
    /// Requiert : token JWT valide
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        // Récupérer l'ID utilisateur depuis le token JWT
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var result = await _authService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Mot de passe modifié avec succès." });
    }

    /// <summary>
    /// Retourne les informations de l'utilisateur connecté.
    /// GET /api/auth/me
    /// Requiert : token JWT valide
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            id    = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            name  = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            role  = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
        });
    }
}

/// <summary>DTO pour changer le mot de passe.</summary>
public record ChangePasswordDto(string CurrentPassword, string NewPassword);