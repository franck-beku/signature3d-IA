using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation temporaire du service de stockage.
/// Sera remplacé par SupabaseStorageService quand Supabase Storage sera configuré.
/// </summary>
public class NullStorageService : IStorageService
{
    public Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder, bool isPrivate = false, string contentType = "application/pdf")
        => Task.FromResult(Result<string>.Ok(isPrivate
            ? $"documents-private/{folder}/{fileName}"
            : $"https://placeholder.storage/{folder}/{fileName}"));

    public Task<Result<string>> GetSignedUrlAsync(string privateReference, int expiresInSeconds = 300)
        => Task.FromResult(Result<string>.Ok($"https://placeholder.storage/signed/{privateReference}"));

    public Task<Result> DeleteAsync(string urlOrReference)
        => Task.FromResult(Result.Ok());

    public Task<Result<string>> MoveToPrivateAsync(string publicUrl)
        => Task.FromResult(Result<string>.Ok($"documents-private/{publicUrl}"));

    public Task<Result<string>> MoveToPublicAsync(string privateReference)
        => Task.FromResult(Result<string>.Ok($"https://placeholder.storage/{privateReference}"));
}