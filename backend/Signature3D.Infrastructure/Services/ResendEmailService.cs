using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation de IEmailService via l'API HTTP de Resend (https://resend.com).
/// Pas de SDK : un simple POST JSON sur /emails.
/// L'envoi ne doit JAMAIS faire échouer la création du lead — l'appelant
/// (LeadService) ignore le résultat en cas d'échec et se contente de logger.
/// </summary>
public class ResendEmailService : IEmailService
{
    private const string ResendEndpoint = "https://api.resend.com/emails";

    private readonly HttpClient _http;
    private readonly ResendSettings _settings;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient http,
        ResendSettings settings,
        ILogger<ResendEmailService> logger)
    {
        _http = http;
        _settings = settings;
        _logger = logger;
    }

    public async Task<Result> SendLeadNotificationAsync(
        IEnumerable<string> recipients,
        string projectName,
        string leadName,
        string? leadContact,
        string? message)
    {
        // Garde-fous : pas de clé ou pas de destinataire → on n'envoie rien,
        // mais on ne fait pas échouer le flux (le lead est déjà sauvegardé).
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _logger.LogWarning("Resend : ApiKey absente — notification de lead non envoyée.");
            return Result.Fail("Resend ApiKey absente.");
        }

        var to = recipients
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Distinct()
            .ToArray();

        if (to.Length == 0)
        {
            _logger.LogWarning("Resend : aucun destinataire — notification de lead non envoyée.");
            return Result.Fail("Aucun destinataire.");
        }

        var subject = $"Nouveau lead — {projectName}";
        var html = BuildHtml(projectName, leadName, leadContact, message);

        var payload = new
        {
            from = $"{_settings.FromName} <{_settings.FromEmail}>",
            to,
            subject,
            html
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, ResendEndpoint)
            {
                Content = JsonContent.Create(payload)
            };
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

            using var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "Resend : échec d'envoi ({Status}) — {Body}",
                    (int)response.StatusCode, body);
                return Result.Fail($"Resend a renvoyé {(int)response.StatusCode}.");
            }

            _logger.LogInformation(
                "Resend : notification de lead envoyée à {Recipients}.",
                string.Join(", ", to));
            return Result.Ok();
        }
        catch (Exception ex)
        {
            // Réseau coupé, timeout, etc. — on log et on continue.
            _logger.LogError(ex, "Resend : exception lors de l'envoi de la notification de lead.");
            return Result.Fail("Exception lors de l'envoi Resend.");
        }
    }

    private static string BuildHtml(string projectName, string leadName, string? leadContact, string? message)
    {
        // Échappement minimal pour éviter de casser le HTML avec du contenu visiteur.
        string E(string? s) => System.Net.WebUtility.HtmlEncode(s ?? "—");

        return $@"
<div style=""font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #101010;"">
  <div style=""border-left: 4px solid #C8A45D; padding: 8px 16px; margin-bottom: 20px;"">
    <h2 style=""margin: 0; font-size: 20px;"">Nouveau lead reçu</h2>
    <p style=""margin: 4px 0 0; color: #6B6B6B; font-size: 14px;"">{E(projectName)}</p>
  </div>
  <table style=""width: 100%; border-collapse: collapse; font-size: 15px;"">
    <tr>
      <td style=""padding: 8px 0; color: #6B6B6B; width: 120px;"">Nom</td>
      <td style=""padding: 8px 0; font-weight: 600;"">{E(leadName)}</td>
    </tr>
    <tr>
      <td style=""padding: 8px 0; color: #6B6B6B;"">Contact</td>
      <td style=""padding: 8px 0;"">{E(leadContact)}</td>
    </tr>
    <tr>
      <td style=""padding: 8px 0; color: #6B6B6B; vertical-align: top;"">Message</td>
      <td style=""padding: 8px 0;"">{E(message)}</td>
    </tr>
  </table>
  <p style=""margin-top: 24px; font-size: 12px; color: #9A9A9A;"">
    Lead enregistré dans le dashboard Signature Immersion.
  </p>
</div>";
    }
}