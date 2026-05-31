using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de stockage des fichiers (PDFs, images) sur Supabase Storage.
/// </summary>
public interface IStorageService
{
    Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder);
    Task<Result> DeleteAsync(string fileUrl);
}