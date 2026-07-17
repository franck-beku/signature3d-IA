using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.AI.Providers;

/// <summary>
/// Provider OCR Google Cloud Vision (images:annotate, TEXT_DETECTION) — appel HTTP
/// synchrone unique, authentification par clé API (pas de service account JSON).
/// </summary>
public class GoogleVisionOcrProvider : IOcrProvider
{
    private readonly GoogleVisionSettings _settings;
    private readonly HttpClient _http;

    public GoogleVisionOcrProvider(GoogleVisionSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://vision.googleapis.com/v1/"),
            Timeout = TimeSpan.FromSeconds(AppConstants.AIProviderTimeoutSeconds)
        };
    }

    public async Task<Result<string>> ExtractTextFromImageAsync(byte[] imageBytes)
    {
        try
        {
            var requestBody = new
            {
                requests = new[]
                {
                    new
                    {
                        image = new { content = Convert.ToBase64String(imageBytes) },
                        features = new[] { new { type = "TEXT_DETECTION" } },
                        imageContext = new { languageHints = new[] { "fr" } }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync($"images:annotate?key={_settings.ApiKey}", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur Google Vision : {response.StatusCode} — {responseJson}");

            var doc = JsonDocument.Parse(responseJson);
            var visionResponse = doc.RootElement.GetProperty("responses")[0];

            if (visionResponse.TryGetProperty("error", out var error))
                return Result<string>.Fail($"Erreur Google Vision : {error.GetProperty("message").GetString()}");

            // Aucun texte détecté — appel réussi, résultat vide (pas une erreur).
            if (!visionResponse.TryGetProperty("fullTextAnnotation", out var fullTextAnnotation))
                return Result<string>.Ok(string.Empty);

            return Result<string>.Ok(fullTextAnnotation.GetProperty("text").GetString() ?? string.Empty);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur Google Vision : {ex.Message}");
        }
    }
}
