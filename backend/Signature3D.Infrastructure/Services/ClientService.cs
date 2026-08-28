using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Clients;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de gestion des clients.
/// CRUD complet — créer, lire, modifier, supprimer un client depuis le dashboard.
/// </summary>
public class ClientService : IClientService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storageService;

    public ClientService(AppDbContext db, IStorageService storageService)
    {
        _db = db;
        _storageService = storageService;
    }

    /// <summary>Retourne tous les clients paginés.</summary>
    public async Task<Result<PagedResult<ClientDto>>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.Clients
            .Include(c => c.Sector)
            .Include(c => c.Projects)
            .OrderByDescending(c => c.CreatedAt);

        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return Result<PagedResult<ClientDto>>.Ok(new PagedResult<ClientDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>Retourne un client par son slug.</summary>
    public async Task<Result<ClientDto>> GetBySlugAsync(string slug)
    {
        var client = await _db.Clients
            .Include(c => c.Sector)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (client is null)
            return Result<ClientDto>.Fail($"Client '{slug}' introuvable.");

        return Result<ClientDto>.Ok(MapToDto(client));
    }

    /// <summary>
    /// Valide les trois dates contractuelles selon le statut, indépendamment de Create/Update :
    /// - Prospect/Inactif : aucune exigence (NULL autorisé, historique conservé tel quel).
    /// - EnCours/Actif : les trois dates sont obligatoires.
    /// - Chronologie ContractDate ≤ DeliveryDate ≤ ContractEndDate vérifiée dès que les deux
    ///   valeurs comparées sont présentes, même si la troisième est absente (donnée historique
    ///   partielle possible pour un Prospect redescendu depuis un statut supérieur).
    /// Comparaison au niveau de la date seule (.Date) pour ignorer toute composante horaire.
    /// </summary>
    private static Result<ClientDto>? ValidateContractDates(
        ClientStatus status, DateTime? contractDate, DateTime? deliveryDate, DateTime? contractEndDate)
    {
        if ((status == ClientStatus.EnCours || status == ClientStatus.Actif) &&
            (contractDate is null || deliveryDate is null || contractEndDate is null))
        {
            return Result<ClientDto>.Fail(
                "Un client \"En cours\" ou \"Actif\" doit avoir une date de contrat, une date de livraison et une date de fin de contrat.");
        }

        if (contractDate.HasValue && deliveryDate.HasValue && contractDate.Value.Date > deliveryDate.Value.Date)
            return Result<ClientDto>.Fail("La date de livraison ne peut pas être antérieure à la date de contrat.");

        if (deliveryDate.HasValue && contractEndDate.HasValue && deliveryDate.Value.Date > contractEndDate.Value.Date)
            return Result<ClientDto>.Fail("La date de fin de contrat ne peut pas être antérieure à la date de livraison.");

        if (contractDate.HasValue && contractEndDate.HasValue && contractDate.Value.Date > contractEndDate.Value.Date)
            return Result<ClientDto>.Fail("La date de fin de contrat ne peut pas être antérieure à la date de contrat.");

        return null;
    }

    private static DateTime? AsUtcOrNull(DateTime? dt) =>
        dt.HasValue ? DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc) : null;

    /// <summary>Crée un nouveau client depuis le dashboard.</summary>
    public async Task<Result<ClientDto>> CreateAsync(CreateClientDto dto)
    {
        var slug = GenerateSlug(dto.Name);

        if (await _db.Clients.AnyAsync(c => c.Slug == slug))
            slug = $"{slug}-{DateTime.UtcNow.Ticks}";

        if (!Enum.TryParse<ClientStatus>(dto.Status, out var status))
            status = ClientStatus.Prospect;

        var validationError = ValidateContractDates(status, dto.ContractDate, dto.DeliveryDate, dto.ContractEndDate);
        if (validationError is not null)
            return validationError;

        var client = new Client
        {
            Name            = dto.Name,
            Slug            = slug,
            Email           = dto.Email,
            Phone           = dto.Phone,
            Notes           = dto.Notes,
            ContractDate    = AsUtcOrNull(dto.ContractDate),
            DeliveryDate    = AsUtcOrNull(dto.DeliveryDate),
            ContractEndDate = AsUtcOrNull(dto.ContractEndDate),
            Status          = status,
            Priority        = dto.Priority,
            SectorId        = dto.SectorId
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync();

        await _db.Entry(client).Reference(c => c.Sector).LoadAsync();

        return Result<ClientDto>.Ok(MapToDto(client));
    }

    /// <summary>Modifie un client existant.</summary>
    public async Task<Result<ClientDto>> UpdateAsync(Guid id, UpdateClientDto dto)
    {
        var client = await _db.Clients
            .Include(c => c.Sector)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client is null)
            return Result<ClientDto>.Fail("Client introuvable.");

        if (!Enum.TryParse<ClientStatus>(dto.Status, out var status))
            status = client.Status;

        var validationError = ValidateContractDates(status, dto.ContractDate, dto.DeliveryDate, dto.ContractEndDate);
        if (validationError is not null)
            return validationError;

        client.Name            = dto.Name;
        client.Email           = dto.Email;
        client.Phone           = dto.Phone;
        client.Notes           = dto.Notes;
        // Le frontend est responsable de retransmettre les dates existantes inchangées quand
        // ses champs sont masqués (ex. statut Prospect) — voir ClientEditForm/nouveau-client.
        // Le backend ne fait jamais d'hypothèse : il persiste exactement ce qui est envoyé.
        client.ContractDate    = AsUtcOrNull(dto.ContractDate);
        client.DeliveryDate    = AsUtcOrNull(dto.DeliveryDate);
        client.ContractEndDate = AsUtcOrNull(dto.ContractEndDate);
        client.Status          = status;
        client.Priority        = dto.Priority;
        client.SectorId        = dto.SectorId;
        client.UpdatedAt       = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(client).Reference(c => c.Sector).LoadAsync();

        return Result<ClientDto>.Ok(MapToDto(client));
    }

    /// <summary>Upload du contrat PDF pour un client.</summary>
    public async Task<Result<ClientDto>> UploadContractAsync(Guid id, IFormFile file)
    {
        var client = await _db.Clients
            .Include(c => c.Sector)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client is null)
            return Result<ClientDto>.Fail("Client introuvable.");

        if (file is null || file.Length == 0)
            return Result<ClientDto>.Fail("Fichier invalide.");

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return Result<ClientDto>.Fail("Seuls les fichiers PDF sont acceptés.");

        // Vérifie la signature réelle du fichier (%PDF-) — pas seulement l'extension du nom.
        using (var headerStream = file.OpenReadStream())
        {
            var header = new byte[5];
            var bytesRead = await headerStream.ReadAsync(header.AsMemory(0, 5));
            if (bytesRead < 5 || System.Text.Encoding.ASCII.GetString(header) != "%PDF-")
                return Result<ClientDto>.Fail("Le fichier n'est pas un PDF valide.");
        }

        if (file.Length > 50 * 1024 * 1024) // 50 MB max
            return Result<ClientDto>.Fail("Le fichier ne doit pas dépasser 50 MB.");

        using var stream = file.OpenReadStream();
        var uploadResult = await _storageService.UploadAsync(stream, $"{Guid.NewGuid()}.pdf", $"contracts/{id}");

        if (!uploadResult.Success)
            return Result<ClientDto>.Fail("Erreur lors de l'upload du contrat.");

        client.ContractFileUrl = uploadResult.Data;
        client.UpdatedAt       = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result<ClientDto>.Ok(MapToDto(client));
    }

    /// <summary>Supprime un client et tous ses projets (cascade).</summary>
    public async Task<Result> DeleteAsync(Guid id)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client is null)
            return Result.Fail("Client introuvable.");

        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>Convertit une entité Client en DTO.</summary>
    private static ClientDto MapToDto(Client c) => new()
    {
        Id              = c.Id,
        Name            = c.Name,
        Slug            = c.Slug,
        Email           = c.Email,
        Phone           = c.Phone,
        Notes           = c.Notes,
        ContractDate    = c.ContractDate,
        DeliveryDate    = c.DeliveryDate,
        ContractEndDate = c.ContractEndDate,
        Status          = c.Status.ToString(),
        Priority        = c.Priority,
        SectorId        = c.SectorId,
        SectorName      = c.Sector?.Name ?? string.Empty,
        SectorSlug      = c.Sector?.Slug ?? string.Empty,
        ProjectCount    = c.Projects?.Count ?? 0,
        ContractFileUrl = c.ContractFileUrl,
        CreatedAt       = c.CreatedAt
    };

    /// <summary>Génère un slug URL-friendly à partir d'un nom.</summary>
    private static string GenerateSlug(string name) =>
        name.ToLower()
            .Replace(" ", "-")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("à", "a").Replace("â", "a")
            .Replace("ô", "o").Replace("î", "i")
            .Replace("ç", "c")
            .Replace("'", "").Replace("'", "")
            .Replace("/", "-").Replace("..", "");
}