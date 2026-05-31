using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation temporaire du service de stockage.
/// Sera remplacé par SupabaseStorageService quand Supabase Storage sera configuré.
/// </summary>
public class NullStorageService : IStorageService
{
    public Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder)
        => Task.FromResult(Result<string>.Ok($"https://placeholder.storage/{folder}/{fileName}"));

    public Task<Result> DeleteAsync(string fileUrl)
        => Task.FromResult(Result.Ok());
}