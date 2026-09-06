using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA Groq — rapide et économique.
/// Implémente IAIProvider pour être interchangeable avec OpenAI, Claude, Gemini.
/// Modèle par défaut : openai/gpt-oss-120b
/// </summary>
public class GroqProvider : IAIProvider
{
    private readonly GroqSettings _settings;
    private readonly HttpClient _http;
    private readonly ILogger<GroqProvider> _logger;

    /// <summary>Nom du provider — utilisé pour les logs et le monitoring.</summary>
    public string ProviderName => "Groq";

    public GroqProvider(GroqSettings settings, ILogger<GroqProvider> logger)
    {
        _settings = settings;
        _logger = logger;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://api.groq.com/openai/v1/"),
            Timeout = TimeSpan.FromSeconds(AppConstants.AIProviderTimeoutSeconds)
        };
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", settings.ApiKey);
    }

    /// <summary>
    /// Génère une réponse contextuelle pour Luxedia IA.
    /// Envoie le prompt système + historique + contexte RAG à Groq.
    /// </summary>
    public async Task<Result<string>> GenerateResponseAsync(
        string systemPrompt,
        List<(string Role, string Content)> messages,
        string? context = null)
    {
        try
        {
            // Construire le prompt système avec le contexte RAG si disponible
            var fullSystemPrompt = string.IsNullOrEmpty(context)
                ? systemPrompt
                : $"{systemPrompt}\n\nContexte des documents :\n{context}";

            // Construire la liste des messages
            var chatMessages = new List<object>
            {
                new { role = "system", content = fullSystemPrompt }
            };

            // Ajouter l'historique de la conversation
            foreach (var (role, content) in messages)
            {
                chatMessages.Add(new { role = role.ToLower(), content });
            }

            // Corps de la requête
            var requestBody = new
            {
                model       = _settings.Model,
                messages    = chatMessages,
                max_tokens  = _settings.MaxTokens,
                temperature = _settings.Temperature,
            };

            var json    = JsonSerializer.Serialize(requestBody);
            var content2 = new StringContent(json, Encoding.UTF8, "application/json");

            // Appel à l'API Groq
            var response = await _http.PostAsync("chat/completions", content2);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // Erreur structurée de l'API Groq : {"error":{"message":...,"type":...,"code":...}}
                // — extraction best-effort pour un log exploitable ; jamais la clé/l'en-tête
                // Authorization, jamais le contenu (contexte RAG/documents), qui ne figurent de
                // toute façon pas dans la réponse d'erreur de Groq.
                string? errorType = null, errorCode = null, errorMessage = null;
                try
                {
                    var errDoc = JsonDocument.Parse(responseJson);
                    if (errDoc.RootElement.TryGetProperty("error", out var errEl))
                    {
                        errorMessage = errEl.TryGetProperty("message", out var m) ? m.GetString() : null;
                        errorType    = errEl.TryGetProperty("type", out var t) ? t.GetString() : null;
                        errorCode    = errEl.TryGetProperty("code", out var c) ? c.GetString() : null;
                    }
                }
                catch (JsonException)
                {
                    // Corps de réponse non-JSON (ex. erreur de proxy/passerelle) — on garde le
                    // texte brut ci-dessous plutôt que de faire planter le logging lui-même.
                }

                _logger.LogError(
                    "Échec génération Groq — provider={Provider} model={Model} status={Status} type={ErrorType} code={ErrorCode} message={ErrorMessage}",
                    ProviderName, _settings.Model, (int)response.StatusCode, errorType, errorCode, errorMessage ?? responseJson);

                return Result<string>.Fail($"Erreur Groq : {response.StatusCode} — {responseJson}");
            }

            // Parser la réponse
            var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return Result<string>.Ok(text ?? string.Empty);
        }
        catch (Exception ex)
        {
            // ex.Message provient de HttpClient/.NET (timeout, DNS, etc.) — jamais de la clé API
            // ni de l'en-tête Authorization, qui ne sont jamais inclus dans ces messages.
            _logger.LogError(ex,
                "Exception lors de l'appel Groq — provider={Provider} model={Model} exceptionType={ExceptionType}",
                ProviderName, _settings.Model, ex.GetType().Name);

            return Result<string>.Fail($"Erreur Groq : {ex.Message}");
        }
    }
}