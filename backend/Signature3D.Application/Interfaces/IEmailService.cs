using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service d'envoi d'emails via Resend — notifications de leads.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Envoie une notification de lead à un ou plusieurs destinataires.
    /// </summary>
    /// <param name="recipients">Adresses de réception (Franck + Alain, ou le LeadEmail du projet).</param>
    /// <param name="projectName">Nom du projet, ou "Contact général" pour un lead du site.</param>
    /// <param name="leadName">Nom laissé par le visiteur.</param>
    /// <param name="leadContact">Courriel ou téléphone laissé par le visiteur.</param>
    /// <param name="message">Message du visiteur (ou le libellé du bouton).</param>
    Task<Result> SendLeadNotificationAsync(
        IEnumerable<string> recipients,
        string projectName,
        string leadName,
        string? leadContact,
        string? message);
}