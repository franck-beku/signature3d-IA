namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres OpenAI — provider IA secondaire.
/// </summary>
public class OpenAISettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4o-mini";
    public string EmbeddingModel { get; set; } = "text-embedding-3-small";
    public int MaxTokens { get; set; } = 1024;
    public double Temperature { get; set; } = 0.7;
}