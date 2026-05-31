using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA Claude (Anthropic) — claude-3-haiku.
/// Implémente IAIProvider pour être interchangeable.
/// </summary>
public class ClaudeProvider : IAIProvider
{
    private readonly ClaudeSettings _settings;
    private readonly HttpClient _http;

    public string ProviderName => "Claude";

    public ClaudeProvider(ClaudeSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://api.anthropic.com/v1/")
        };
        _http.DefaultRequestHeaders.Add("x-api-key", settings.ApiKey);
        _http.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
    }

    /// <summary>Génère une réponse via Claude (Anthropic API).</summary>
    public async Task<Result<string>> GenerateResponseAsync(
        string systemPrompt,
        List<(string Role, string Content)> messages,
        string? context = null)
    {
        try
        {
            var fullSystem = string.IsNullOrEmpty(context)
                ? systemPrompt
                : $"{systemPrompt}\n\nContexte des documents :\n{context}";

            var chatMessages = messages
                .Select(m => new { role = m.Role.ToLower(), content = m.Content })
                .ToList<object>();

            var requestBody = new
            {
                model      = _settings.Model,
                max_tokens = _settings.MaxTokens,
                system     = fullSystem,
                messages   = chatMessages,
            };

            var json     = JsonSerializer.Serialize(requestBody);
            var content  = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("messages", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur Claude : {response.StatusCode}");

            var doc  = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return Result<string>.Ok(text ?? string.Empty);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur Claude : {ex.Message}");
        }
    }

    /// <summary>Claude ne supporte pas les embeddings — utiliser OpenAI.</summary>
    public Task<Result<float[]>> GenerateEmbeddingAsync(string text) =>
        Task.FromResult(Result<float[]>.Fail(
            "Claude ne supporte pas les embeddings. Utilisez OpenAI."
        ));
}