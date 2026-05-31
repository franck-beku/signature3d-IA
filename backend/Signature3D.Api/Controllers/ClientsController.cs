using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Clients;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller de gestion des clients.
/// CRUD complet — utilisé par le dashboard pour créer et gérer les clients.
/// Route : /api/clients
/// Tous les endpoints requièrent un token JWT valide (Alain ou Franck).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    /// Retourne tous les clients paginés.
    /// GET /api/clients?page=1&pageSize=20
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _clientService.GetAllAsync(page, pageSize);
        return Ok(result.Data);
    }

    /// <summary>
    /// Retourne un client par son slug.
    /// GET /api/clients/mercedes-quebec
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _clientService.GetBySlugAsync(slug);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Crée un nouveau client depuis le dashboard.
    /// POST /api/clients
    /// Body : { "name": "Mercedes Québec", "email": "...", "sectorId": "..." }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        var result = await _clientService.CreateAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetBySlug),
            new { slug = result.Data!.Slug },
            result.Data);
    }

    /// <summary>
    /// Modifie un client existant.
    /// PUT /api/clients/{id}
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClientDto dto)
    {
        var result = await _clientService.UpdateAsync(id, dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>
    /// Supprime un client et tous ses projets.
    /// DELETE /api/clients/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _clientService.DeleteAsync(id);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

    /// <summary>
/// Upload du contrat PDF pour un client.
/// POST /api/clients/{id}/contract
/// </summary>
[HttpPost("{id:guid}/contract")]
public async Task<IActionResult> UploadContract(Guid id, IFormFile file)
{
    var result = await _clientService.UploadContractAsync(id, file);

    if (!result.Success)
        return BadRequest(new { message = result.Error });

    return Ok(result.Data);
}
}