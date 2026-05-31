namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Microsoft Copilot (Azure OpenAI) — provider IA alternatif.
/// </summary>
public class CopilotSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "2024-02-01";
    public int MaxTokens { get; set; } = 1024;
    public double Temperature { get; set; } = 0.7;
}