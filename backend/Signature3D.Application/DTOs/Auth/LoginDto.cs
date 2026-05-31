namespace Signature3D.Application.DTOs.Auth;

/// <summary>
/// Données de connexion — email + mot de passe.
/// </summary>
public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}