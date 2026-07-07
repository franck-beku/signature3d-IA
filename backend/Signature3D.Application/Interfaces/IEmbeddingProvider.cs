using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Providers IA capables de générer des vecteurs d'embedding pour la recherche sémantique RAG.
/// Séparé de IAIProvider — tous les providers de génération de réponse ne supportent pas
/// les embeddings (Groq, Claude ne les implémentent pas).
/// </summary>
public interface IEmbeddingProvider
{
    /// <summary>Génère un vecteur d'embedding pour la recherche sémantique RAG.</summary>
    Task<Result<float[]>> GenerateEmbeddingAsync(string text);
}
