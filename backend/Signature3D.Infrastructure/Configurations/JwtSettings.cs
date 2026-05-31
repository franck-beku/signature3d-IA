namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres JWT pour l'authentification des utilisateurs du dashboard.
/// </summary>
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}