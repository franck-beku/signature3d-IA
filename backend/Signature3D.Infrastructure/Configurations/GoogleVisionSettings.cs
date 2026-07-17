namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Google Cloud Vision — OCR de secours pour les pages PDF à faible texte.
/// </summary>
public class GoogleVisionSettings
{
    public string ApiKey { get; set; } = string.Empty;
}
