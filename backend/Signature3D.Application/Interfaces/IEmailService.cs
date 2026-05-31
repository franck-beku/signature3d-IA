using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service d'envoi d'emails via Resend — notifications de leads.
/// </summary>
public interface IEmailService
{
    Task<Result> SendLeadNotificationAsync(string toEmail, string projectName, string leadName, string message);
}