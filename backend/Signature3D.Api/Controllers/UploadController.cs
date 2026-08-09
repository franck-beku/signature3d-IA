using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller d'upload générique, réutilisable par n'importe quel champ image du dashboard
/// (témoignages, avatar Luxedia, logo client, etc. — pas encore câblé partout, ajouté au fur
/// et à mesure des besoins).
/// Route : /api/upload
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IStorageService _storageService;

    private static readonly Dictionary<string, string> AllowedImageTypes = new()
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
    };

    public UploadController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    /// <summary>
    /// Upload générique d'une image (JPEG/PNG). POST /api/upload/image
    /// Content-Type: multipart/form-data — champs "file" (obligatoire) et "folder" (optionnel,
    /// ex. "testimonials", "avatars" — sert uniquement à organiser le bucket, défaut "uploads").
    /// Retourne { url } : l'URL publique du fichier uploadé.
    /// </summary>
    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage([FromForm] UploadImageRequest request)
    {
        var file = request.File;

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Fichier manquant." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageTypes.TryGetValue(extension, out var contentType))
            return BadRequest(new { message = "Seuls les fichiers JPEG et PNG sont acceptés." });

        // Vérifie la signature réelle du fichier — pas seulement l'extension du nom.
        using (var headerStream = file.OpenReadStream())
        {
            var header = new byte[8];
            var bytesRead = await headerStream.ReadAsync(header.AsMemory(0, 8));
            var isJpeg = bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
            var isPng = bytesRead >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;

            if (!isJpeg && !isPng)
                return BadRequest(new { message = "Le fichier n'est pas une image JPEG ou PNG valide." });
        }

        if (file.Length > 5 * 1024 * 1024) // 5 MB max
            return BadRequest(new { message = "Le fichier ne doit pas dépasser 5 MB." });

        var folder = string.IsNullOrWhiteSpace(request.Folder) ? "uploads" : request.Folder;
        var fileName = $"{Guid.NewGuid()}{extension}";

        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadAsync(stream, fileName, folder, isPrivate: false, contentType: contentType);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { url = result.Data });
    }
}

/// <summary>
/// Modèle groupé pour l'upload — un IFormFile mêlé à d'autres paramètres [FromForm] au niveau
/// de l'action fait planter la génération du schéma Swashbuckle (même contrainte que pour
/// UploadDocumentRequest dans DocumentsController).
/// </summary>
public class UploadImageRequest
{
    public IFormFile File { get; set; } = null!;
    public string? Folder { get; set; }
}
