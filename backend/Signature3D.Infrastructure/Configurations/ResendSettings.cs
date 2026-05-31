namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Resend — service d'envoi d'emails pour les leads.
/// </summary>
public class ResendSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "leads@signature3dia.com";
    public string FromName { get; set; } = "Signature 3D IA";
}