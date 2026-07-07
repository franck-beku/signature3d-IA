namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Clé de cache partagée entre ChatService (lecture) et DocumentService (invalidation)
/// pour le cache court des chunks RAG — une seule source de vérité évite un désync silencieux.
/// </summary>
internal static class RagCacheKeys
{
    public static string ForProject(Guid projectId) => $"rag-chunks:{projectId}";
}
