using System.Net.Http.Headers;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.Storage;

/// <summary>
/// Service de stockage des fichiers PDF dans Supabase Storage.
/// Upload, téléchargement et suppression des documents clients.
/// </summary>
public class SupabaseStorageService : IStorageService
{
    private readonly SupabaseSettings _settings;
    private readonly HttpClient _http;

    private const string BucketName = "documents";

    public SupabaseStorageService(SupabaseSettings settings)
    {
        _settings = settings;
        _http = new HttpClient
        {
            BaseAddress = new Uri($"{settings.Url}/storage/v1/")
        };
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", settings.ServiceRoleKey);
        _http.DefaultRequestHeaders.Add("apikey", settings.ServiceRoleKey);
    }

    /// <summary>
    /// Upload un fichier dans Supabase Storage.
    /// Retourne l'URL publique du fichier.
    /// </summary>
    public async Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder)
    {
        try
        {
            // Chemin du fichier dans le bucket : folder/fileName
            var filePath = $"{folder}/{fileName}";

            using var content = new StreamContent(fileStream);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");

            var response = await _http.PostAsync(
                $"object/{BucketName}/{filePath}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return Result<string>.Fail($"Erreur upload Supabase : {response.StatusCode} — {errorBody}");
            }

            // Construire l'URL publique du fichier
            var fileUrl = $"{_settings.Url}/storage/v1/object/public/{BucketName}/{filePath}";

            return Result<string>.Ok(fileUrl);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur upload : {ex.Message}");
        }
    }

    /// <summary>
    /// Supprime un fichier de Supabase Storage.
    /// </summary>
    public async Task<Result> DeleteAsync(string fileUrl)
    {
        try
        {
            // Extraire le chemin depuis l'URL
            var uri     = new Uri(fileUrl);
            var path    = uri.AbsolutePath;
            var prefix  = $"/storage/v1/object/public/{BucketName}/";

            if (!path.StartsWith(prefix))
                return Result.Ok(); // Fichier placeholder — ignorer

            var filePath = path[prefix.Length..];

            // Body JSON avec la liste des fichiers à supprimer
            var body = JsonSerializer.Serialize(new { prefixes = new[] { filePath } });
            var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

            var response = await _http.PostAsync(
                $"object/{BucketName}",
                content
            );

            // 200 ou 404 sont acceptables
            if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return Result.Fail($"Erreur suppression Supabase : {response.StatusCode} — {errorBody}");
            }

            return Result.Ok();
        }
        catch (Exception ex)
        {
            return Result.Fail($"Erreur suppression : {ex.Message}");
        }
    }
}