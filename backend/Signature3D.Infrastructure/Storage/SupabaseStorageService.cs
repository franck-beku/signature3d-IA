using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Signature3D.Application.Common;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;

namespace Signature3D.Infrastructure.Storage;

/// <summary>
/// Service de stockage des fichiers PDF dans Supabase Storage.
/// Upload, téléchargement et suppression des documents clients.
/// Bucket public "documents" pour les fichiers ordinaires, bucket privé
/// "documents-private" (policy "Public bucket" désactivée côté Supabase)
/// pour les documents marqués internes — accès uniquement via URL signée temporaire.
/// </summary>
public class SupabaseStorageService : IStorageService
{
    private readonly SupabaseSettings _settings;
    private readonly HttpClient _http;

    private const string BucketName = "documents";
    private const string PrivateBucketName = "documents-private";

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
    /// Retourne l'URL publique du fichier (isPrivate = false), ou une référence privée
    /// au format "documents-private/{chemin}" (isPrivate = true) — jamais une URL
    /// directement exploitable dans ce second cas.
    /// </summary>
    public async Task<Result<string>> UploadAsync(Stream fileStream, string fileName, string folder, bool isPrivate = false, string contentType = "application/pdf")
    {
        try
        {
            var bucket = isPrivate ? PrivateBucketName : BucketName;

            // Chemin du fichier dans le bucket : folder/fileName
            var filePath = $"{folder}/{fileName}";

            using var content = new StreamContent(fileStream);
            content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            var response = await _http.PostAsync(
                $"object/{bucket}/{filePath}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return Result<string>.Fail($"Erreur upload Supabase : {response.StatusCode} — {errorBody}");
            }

            if (isPrivate)
                return Result<string>.Ok($"{PrivateBucketName}/{filePath}");

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
    /// Supprime un fichier de Supabase Storage — accepte une URL publique
    /// ("https://...") ou une référence privée ("documents-private/chemin").
    /// </summary>
    public async Task<Result> DeleteAsync(string urlOrReference)
    {
        try
        {
            string bucket;
            string filePath;

            if (urlOrReference.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                // URL publique — extraire le chemin
                var uri    = new Uri(urlOrReference);
                var path   = uri.AbsolutePath;
                var prefix = $"/storage/v1/object/public/{BucketName}/";

                if (!path.StartsWith(prefix))
                    return Result.Ok(); // Fichier placeholder — ignorer

                bucket   = BucketName;
                filePath = path[prefix.Length..];
            }
            else
            {
                // Référence privée "bucket/chemin"
                var parts = urlOrReference.Split('/', 2);
                if (parts.Length != 2)
                    return Result.Ok(); // Référence invalide — ignorer plutôt que planter

                bucket   = parts[0];
                filePath = parts[1];
            }

            var request  = new HttpRequestMessage(HttpMethod.Delete, $"object/{bucket}/{filePath}");
            var response = await _http.SendAsync(request);

            // 200 ou 404 sont acceptables (404 = déjà supprimé, ne pas planter)
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

    /// <summary>
    /// Génère une URL signée à durée limitée pour une référence privée "bucket/chemin".
    /// </summary>
    public async Task<Result<string>> GetSignedUrlAsync(string privateReference, int expiresInSeconds = 300)
    {
        try
        {
            var parts = privateReference.Split('/', 2);
            if (parts.Length != 2)
                return Result<string>.Fail("Référence de stockage privée invalide.");

            var bucket   = parts[0];
            var filePath = parts[1];

            var requestBody = new { expiresIn = expiresInSeconds };
            var json        = JsonSerializer.Serialize(requestBody);
            var content      = new StringContent(json, Encoding.UTF8, "application/json");

            var response     = await _http.PostAsync($"object/sign/{bucket}/{filePath}", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail($"Erreur génération URL signée : {response.StatusCode} — {responseJson}");

            var doc         = JsonDocument.Parse(responseJson);
            var signedPath  = doc.RootElement.GetProperty("signedURL").GetString();

            if (string.IsNullOrEmpty(signedPath))
                return Result<string>.Fail("Réponse Supabase sans signedURL.");

            return Result<string>.Ok($"{_settings.Url}/storage/v1{signedPath}");
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur génération URL signée : {ex.Message}");
        }
    }

    /// <summary>Déplace un fichier du bucket public vers le bucket privé. Retourne la nouvelle référence privée.</summary>
    public async Task<Result<string>> MoveToPrivateAsync(string publicUrl)
    {
        try
        {
            var uri    = new Uri(publicUrl);
            var path   = uri.AbsolutePath;
            var prefix = $"/storage/v1/object/public/{BucketName}/";

            if (!path.StartsWith(prefix))
                return Result<string>.Fail("URL publique invalide — chemin introuvable.");

            var filePath = path[prefix.Length..];

            var copyResult = await CopyAsync(BucketName, filePath, PrivateBucketName, filePath);
            if (!copyResult.Success)
                return Result<string>.Fail(copyResult.Error!);

            // Supprimer l'original du bucket public une fois la copie confirmée
            var deleteRequest  = new HttpRequestMessage(HttpMethod.Delete, $"object/{BucketName}/{filePath}");
            var deleteResponse = await _http.SendAsync(deleteRequest);
            if (!deleteResponse.IsSuccessStatusCode && deleteResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                var errorBody = await deleteResponse.Content.ReadAsStringAsync();
                return Result<string>.Fail($"Copie réussie mais suppression de l'original échouée : {deleteResponse.StatusCode} — {errorBody}");
            }

            return Result<string>.Ok($"{PrivateBucketName}/{filePath}");
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur déplacement vers privé : {ex.Message}");
        }
    }

    /// <summary>Déplace un fichier du bucket privé vers le bucket public. Retourne la nouvelle URL publique.</summary>
    public async Task<Result<string>> MoveToPublicAsync(string privateReference)
    {
        try
        {
            var parts = privateReference.Split('/', 2);
            if (parts.Length != 2)
                return Result<string>.Fail("Référence de stockage privée invalide.");

            var filePath = parts[1];

            var copyResult = await CopyAsync(PrivateBucketName, filePath, BucketName, filePath);
            if (!copyResult.Success)
                return Result<string>.Fail(copyResult.Error!);

            var deleteRequest  = new HttpRequestMessage(HttpMethod.Delete, $"object/{PrivateBucketName}/{filePath}");
            var deleteResponse = await _http.SendAsync(deleteRequest);
            if (!deleteResponse.IsSuccessStatusCode && deleteResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                var errorBody = await deleteResponse.Content.ReadAsStringAsync();
                return Result<string>.Fail($"Copie réussie mais suppression de l'original échouée : {deleteResponse.StatusCode} — {errorBody}");
            }

            return Result<string>.Ok($"{_settings.Url}/storage/v1/object/public/{BucketName}/{filePath}");
        }
        catch (Exception ex)
        {
            return Result<string>.Fail($"Erreur déplacement vers public : {ex.Message}");
        }
    }

    /// <summary>Copie un objet d'un bucket vers un autre via l'API Supabase Storage.</summary>
    private async Task<Result> CopyAsync(string sourceBucket, string sourceKey, string destinationBucket, string destinationKey)
    {
        var requestBody = new
        {
            bucketId          = sourceBucket,
            sourceKey,
            destinationBucket,
            destinationKey,
        };

        var json    = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync("object/copy", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            return Result.Fail($"Erreur copie Supabase : {response.StatusCode} — {errorBody}");
        }

        return Result.Ok();
    }
}