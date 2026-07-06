using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de stockage des fichiers (PDFs, images) sur Supabase Storage.
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Upload un fichier. Retourne l'URL publique (isPrivate = false) ou une référence privée
    /// au format "bucket/chemin" (isPrivate = true) — jamais une URL directement exploitable
    /// dans ce second cas.
    /// </summary>
    Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder, bool isPrivate = false);

    /// <summary>Génère une URL signée à durée limitée pour une référence privée "bucket/chemin".</summary>
    Task<Result<string>> GetSignedUrlAsync(string privateReference, int expiresInSeconds = 300);

    /// <summary>Supprime un fichier — accepte une URL publique ou une référence privée "bucket/chemin".</summary>
    Task<Result> DeleteAsync(string urlOrReference);

    /// <summary>Déplace un fichier public vers le bucket privé. Retourne la nouvelle référence privée.</summary>
    Task<Result<string>> MoveToPrivateAsync(string publicUrl);

    /// <summary>Déplace un fichier privé vers le bucket public. Retourne la nouvelle URL publique.</summary>
    Task<Result<string>> MoveToPublicAsync(string privateReference);
}