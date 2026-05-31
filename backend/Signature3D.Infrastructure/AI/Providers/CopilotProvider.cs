using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA Microsoft Copilot (Azure OpenAI).
/// Utilise l'API Azure OpenAI — compatible avec les entreprises qui ont Azure.
/// Implémente IAIProvider pour être interchangeable.
/// </summary>
public class CopilotProvider : IAIProvider
{
    private readonly CopilotSettings _settings;
    private readonly HttpClient _http;

    public string ProviderName => "Copilot";

    public CopilotProvider(CopilotSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri(settings.Endpoint)
        };
        _http.DefaultRequestHeaders.Add("api-key", settings.ApiKey);
    }

    /// <summary>Génère une réponse via Azure OpenAI (Copilot).</summary>
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

            var chatMessages = new List<object>
            {
                new { role = "system", content = fullSystem }
            };

            foreach (var (role, content) in messages)
                chatMessages.Add(new { role = role.ToLower(), content });

            var requestBody = new
            {
                messages    = chatMessages,
                max_tokens  = _settings.MaxTokens,
                temperature = _settings.Temperature,
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content2 = new StringContent(json, Encoding.UTF8, "application/json");

            // URL Azure OpenAI — format : /openai/deployments/{deployment}/chat/completions?api-version=...
            var url = $"openai/deployments/{_settings.DeploymentName}/chat/completions?api-version={_settings.ApiVersion}";
            var response = await _http.PostAsync(url, content2);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur Copilot : {response.StatusCode} — {responseJson}");

            var doc  = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return Result<string>.Ok(text ?? string.Empty);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur Copilot : {ex.Message}");
        }
    }

    /// <summary>
    /// Génère un vecteur d'embedding via Azure OpenAI.
    /// Utilise le modèle text-embedding-ada-002 déployé sur Azure.
    /// </summary>
    public async Task<Result<float[]>> GenerateEmbeddingAsync(string text)
    {
        try
        {
            var requestBody = new { input = text };
            var json        = JsonSerializer.Serialize(requestBody);
            var content     = new StringContent(json, Encoding.UTF8, "application/json");

            // Deployment embedding séparé sur Azure
            var url      = $"openai/deployments/text-embedding-ada-002/embeddings?api-version={_settings.ApiVersion}";
            var response = await _http.PostAsync(url, content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<float[]>.Fail($"Erreur embedding Copilot : {response.StatusCode}");

            var doc       = JsonDocument.Parse(responseJson);
            var embedding = doc.RootElement
                .GetProperty("data")[0]
                .GetProperty("embedding")
                .EnumerateArray()
                .Select(e => e.GetSingle())
                .ToArray();

            return Result<float[]>.Ok(embedding);
        }
        catch (Exception ex)
        {
            return Result<float[]>.Fail($"Erreur embedding Copilot : {ex.Message}");
        }
    }
}