namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Groq — provider IA principal (rapide et économique).
/// </summary>
public class GroqSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "llama3-8b-8192";
    public int MaxTokens { get; set; } = 1024;
    public double Temperature { get; set; } = 0.7;
}