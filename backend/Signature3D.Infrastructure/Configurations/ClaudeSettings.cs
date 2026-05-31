namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Claude (Anthropic) — provider IA alternatif.
/// </summary>
public class ClaudeSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "claude-3-haiku-20240307";
    public int MaxTokens { get; set; } = 1024;
    public double Temperature { get; set; } = 0.7;
}