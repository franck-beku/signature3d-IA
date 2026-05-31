using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider IA Groq — rapide et économique.
/// Implémente IAIProvider pour être interchangeable avec OpenAI, Claude, Gemini.
/// Modèle par défaut : llama3-8b-8192
/// </summary>
public class GroqProvider : IAIProvider
{
    private readonly GroqSettings _settings;
    private readonly HttpClient _http;

    /// <summary>Nom du provider — utilisé pour les logs et le monitoring.</summary>
    public string ProviderName => "Groq";

    public GroqProvider(GroqSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://api.groq.com/openai/v1/")
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
                return Result<string>.Fail($"Erreur Groq : {response.StatusCode} — {responseJson}");

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
            return Result<string>.Fail($"Erreur Groq : {ex.Message}");
        }
    }

    /// <summary>
    /// Génère un vecteur d'embedding pour la recherche sémantique RAG.
    /// Note : Groq ne supporte pas encore les embeddings nativement.
    /// Cette méthode retourne un vecteur vide — utiliser OpenAI pour les embeddings.
    /// </summary>
    public Task<Result<float[]>> GenerateEmbeddingAsync(string text)
    {
        // Groq ne supporte pas les embeddings — retourner vecteur vide
        // En production, utiliser OpenAIProvider pour les embeddings
        return Task.FromResult(Result<float[]>.Fail(
            "Groq ne supporte pas les embeddings. Utilisez OpenAI pour la vectorisation."
        ));
    }
}