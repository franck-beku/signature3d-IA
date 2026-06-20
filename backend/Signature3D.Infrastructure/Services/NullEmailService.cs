using Microsoft.Extensions.Logging;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation « null » de IEmailService : n'envoie rien.
/// Utile en développement local quand on ne veut pas d'envoi réel,
/// ou en repli si Resend n'est pas configuré.
/// </summary>
public class NullEmailService : IEmailService
{
    private readonly ILogger<NullEmailService> _logger;

    public NullEmailService(ILogger<NullEmailService> logger)
    {
        _logger = logger;
    }

    public Task<Result> SendLeadNotificationAsync(
        IEnumerable<string> recipients,
        string projectName,
        string leadName,
        string? leadContact,
        string? message)
    {
        _logger.LogInformation(
            "NullEmailService : notification ignorée (lead « {LeadName} » / projet « {ProjectName} »).",
            leadName, projectName);
        return Task.FromResult(Result.Ok());
    }
}