namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Resend — service d'envoi d'emails pour les leads.
/// </summary>
public class ResendSettings
{
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Adresse expéditrice. Tant que le domaine n'est pas vérifié dans Resend,
    /// utiliser "onboarding@resend.dev". Une fois le domaine vérifié :
    /// "notifications@signatureimmersion.ca".
    /// </summary>
    public string FromEmail { get; set; } = "onboarding@resend.dev";

    public string FromName { get; set; } = "Signature Immersion";

    /// <summary>
    /// Destinataires des notifications de leads « contact général »
    /// (leads du site sans projet associé). Ex. Franck + Alain.
    /// Configurable sans recompiler via appsettings / variables d'env.
    /// </summary>
    public List<string> NotificationRecipients { get; set; } = new();
}