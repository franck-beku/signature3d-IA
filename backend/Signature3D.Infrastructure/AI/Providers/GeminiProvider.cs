using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA Google Gemini — gemini-1.5-flash.
/// Implémente IAIProvider pour être interchangeable avec Groq, OpenAI, Claude.
/// </summary>
public class GeminiProvider : IAIProvider
{
    private readonly GeminiSettings _settings;
    private readonly HttpClient _http;

    public string ProviderName => "Gemini";

    public GeminiProvider(GeminiSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/")
        };
    }

    /// <summary>Génère une réponse via Google Gemini API.</summary>
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

            // Construire les messages au format Gemini
            var contents = new List<object>();

            // Ajouter le prompt système comme premier message utilisateur
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = fullSystem } }
            });
            contents.Add(new
            {
                role = "model",
                parts = new[] { new { text = "Compris. Je suis prêt à vous aider." } }
            });

            // Ajouter l'historique de conversation
            foreach (var (role, content) in messages)
            {
                var geminiRole = role.ToLower() == "assistant" ? "model" : "user";
                contents.Add(new
                {
                    role = geminiRole,
                    parts = new[] { new { text = content } }
                });
            }

            var requestBody = new
            {
                contents,
                generationConfig = new
                {
                    maxOutputTokens = _settings.MaxTokens,
                    temperature     = _settings.Temperature,
                }
            };

            var json     = JsonSerializer.Serialize(requestBody);
            var content2 = new StringContent(json, Encoding.UTF8, "application/json");

            // URL avec clé API en query param (format Gemini)
            var url      = $"models/{_settings.Model}:generateContent?key={_settings.ApiKey}";
            var response = await _http.PostAsync(url, content2);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur Gemini : {response.StatusCode} — {responseJson}");

            var doc  = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return Result<string>.Ok(text ?? string.Empty);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur Gemini : {ex.Message}");
        }
    }

    /// <summary>
    /// Génère un vecteur d'embedding via Gemini text-embedding-004.
    /// </summary>
    public async Task<Result<float[]>> GenerateEmbeddingAsync(string text)
    {
        try
        {
            var requestBody = new
            {
                content = new
                {
                    parts = new[] { new { text } }
                }
            };

            var json     = JsonSerializer.Serialize(requestBody);
            var content  = new StringContent(json, Encoding.UTF8, "application/json");
            var url      = $"models/text-embedding-004:embedContent?key={_settings.ApiKey}";
            var response = await _http.PostAsync(url, content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<float[]>.Fail($"Erreur embedding Gemini : {response.StatusCode}");

            var doc       = JsonDocument.Parse(responseJson);
            var embedding = doc.RootElement
                .GetProperty("embedding")
                .GetProperty("values")
                .EnumerateArray()
                .Select(e => e.GetSingle())
                .ToArray();

            return Result<float[]>.Ok(embedding);
        }
        catch (Exception ex)
        {
            return Result<float[]>.Fail($"Erreur embedding Gemini : {ex.Message}");
        }
    }
}