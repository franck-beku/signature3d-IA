using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation temporaire du service email.
/// Sera remplacé par ResendEmailService quand Resend sera configuré.
/// </summary>
public class NullEmailService : IEmailService
{
    public Task<Result> SendLeadNotificationAsync(string toEmail, string projectName, string leadName, string message)
    {
        Console.WriteLine($"[Email simulé] Lead reçu pour {projectName} — {leadName}");
        return Task.FromResult(Result.Ok());
    }
}