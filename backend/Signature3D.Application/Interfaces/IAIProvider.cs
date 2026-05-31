using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Interface abstraite pour tous les providers IA.
/// Groq, OpenAI, Claude, Gemini, Copilot implémentent tous cette interface.
/// Permet de changer de provider sans modifier le code métier.
/// </summary>
public interface IAIProvider
{
    /// <summary>Nom du provider — ex: "Groq", "OpenAI"</summary>
    string ProviderName { get; }

    /// <summary>Génère une réponse contextuelle basée sur les messages et le contexte RAG.</summary>
    Task<Result<string>> GenerateResponseAsync(
        string systemPrompt,
        List<(string Role, string Content)> messages,
        string? context = null
    );

    /// <summary>Génère un vecteur d'embedding pour la recherche sémantique RAG.</summary>
    Task<Result<float[]>> GenerateEmbeddingAsync(string text);
}