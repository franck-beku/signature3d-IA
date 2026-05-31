namespace Signature3D.Application.DTOs.Auth;

/// <summary>
/// Réponse de connexion — token JWT + infos utilisateur.
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}