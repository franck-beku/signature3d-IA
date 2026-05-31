using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA OpenAI — GPT-4o-mini + embeddings text-embedding-3-small.
/// Supporte les embeddings contrairement à Groq.
/// Utilisé pour la vectorisation RAG des documents.
/// </summary>
public class OpenAIProvider : IAIProvider
{
    private readonly OpenAISettings _settings;
    private readonly HttpClient _http;

    public string ProviderName => "OpenAI";

    public OpenAIProvider(OpenAISettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://api.openai.com/v1/")
        };
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", settings.ApiKey);
    }

    /// <summary>Génère une réponse via GPT-4o-mini.</summary>
    public async Task<Result<string>> GenerateResponseAsync(
        string systemPrompt,
        List<(string Role, string Content)> messages,
        string? context = null)
    {
        try
        {
            var fullSystemPrompt = string.IsNullOrEmpty(context)
                ? systemPrompt
                : $"{systemPrompt}\n\nContexte des documents :\n{context}";

            var chatMessages = new List<object>
            {
                new { role = "system", content = fullSystemPrompt }
            };

            foreach (var (role, content) in messages)
                chatMessages.Add(new { role = role.ToLower(), content });

            var requestBody = new
            {
                model       = _settings.Model,
                messages    = chatMessages,
                max_tokens  = _settings.MaxTokens,
                temperature = _settings.Temperature,
            };

            var json     = JsonSerializer.Serialize(requestBody);
            var content2 = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("chat/completions", content2);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur OpenAI : {response.StatusCode}");

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
            return Result<string>.Fail($"Erreur OpenAI : {ex.Message}");
        }
    }

    /// <summary>
    /// Génère un vecteur d'embedding avec text-embedding-3-small.
    /// Utilisé pour la recherche sémantique RAG.
    /// Dimension : 1536 floats.
    /// </summary>
    public async Task<Result<float[]>> GenerateEmbeddingAsync(string text)
    {
        try
        {
            var requestBody = new
            {
                model = _settings.EmbeddingModel,
                input = text,
            };

            var json     = JsonSerializer.Serialize(requestBody);
            var content  = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("embeddings", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<float[]>.Fail($"Erreur embedding OpenAI : {response.StatusCode}");

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
            return Result<float[]>.Fail($"Erreur embedding OpenAI : {ex.Message}");
        }
    }
}