using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des documents PDF.
/// Les documents alimentent Luxedia IA via le système RAG.
/// Route : /api/documents
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    /// <summary>
    /// Retourne tous les documents d'un projet.
    /// GET /api/documents/project/{projectId}
    /// </summary>
    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _documentService.GetByProjectAsync(projectId);
        return Ok(result.Data);
    }

    /// <summary>
    /// Upload un PDF pour un projet.
    /// POST /api/documents/upload/{projectId}
    /// Content-Type: multipart/form-data
    /// Lance l'indexation RAG automatiquement après upload.
    /// </summary>
    [HttpPost("upload/{projectId:guid}")]
    public async Task<IActionResult> Upload(Guid projectId, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Fichier manquant." });

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Seuls les fichiers PDF sont acceptés." });

        if (file.Length > 20 * 1024 * 1024) // 20 MB max
            return BadRequest(new { message = "Le fichier ne doit pas dépasser 20 MB." });

        using var stream = file.OpenReadStream();
        var result = await _documentService.UploadAsync(projectId, stream, file.FileName);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Supprime un document et ses chunks du système RAG.
    /// DELETE /api/documents/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _documentService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

    /// <summary>
    /// Re-indexe manuellement un document pour le RAG.
    /// POST /api/documents/{id}/index
    /// </summary>
    [HttpPost("{id:guid}/index")]
    public async Task<IActionResult> Index(Guid id)
    {
        var result = await _documentService.IndexAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { message = "Document indexé avec succès." });
    }
}