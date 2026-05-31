using Microsoft.EntityFrameworkCore;
using QRCoder;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.QrCodes;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de génération des QR codes avec logo Signature 3D IA.
/// Génère un QR code PNG et le sauvegarde dans Supabase Storage.
/// </summary>
public class QrCodeService : IQrCodeService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly AppUrlsSettings _urls;

    public QrCodeService(AppDbContext db, IStorageService storage, AppUrlsSettings urls)
    {
        _db = db;
        _storage = storage;
        _urls = urls;
    }

    /// <summary>Génère un QR code pour un projet et le sauvegarde dans Supabase Storage.</summary>
    public async Task<Result<QrCodeDto>> GenerateAsync(Guid projectId)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project is null)
            return Result<QrCodeDto>.Fail("Projet introuvable.");

        var targetUrl = $"{_urls.EmbedBaseUrl}/{project.Slug}";

        // Générer le QR code PNG avec QRCoder
        using var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(targetUrl, QRCodeGenerator.ECCLevel.H);
        using var qrCode = new PngByteQRCode(qrData);
        var qrBytes = qrCode.GetGraphic(10);

        // Uploader dans Supabase Storage
        using var stream = new MemoryStream(qrBytes);
        var uploadResult = await _storage.UploadAsync(stream, $"qr-{project.Slug}.png", "qrcodes");
        if (!uploadResult.Success)
            return Result<QrCodeDto>.Fail(uploadResult.Error!);

        // Supprimer l'ancien QR code si existant
        var existing = await _db.QrCodes.FirstOrDefaultAsync(q => q.ProjectId == projectId);
        if (existing is not null)
            _db.QrCodes.Remove(existing);

        var qrEntity = new QrCode
        {
            ProjectId = projectId,
            ImageUrl = uploadResult.Data!,
            TargetUrl = targetUrl,
            ScanCount = 0
        };

        _db.QrCodes.Add(qrEntity);
        await _db.SaveChangesAsync();

        return Result<QrCodeDto>.Ok(new QrCodeDto
        {
            Id = qrEntity.Id,
            ImageUrl = qrEntity.ImageUrl,
            TargetUrl = qrEntity.TargetUrl,
            ScanCount = qrEntity.ScanCount,
            CreatedAt = qrEntity.CreatedAt
        });
    }

    /// <summary>Incrémente le compteur de scans quand un visiteur scanne le QR code.</summary>
    public async Task<Result> TrackScanAsync(Guid projectId)
    {
        var qrCode = await _db.QrCodes.FirstOrDefaultAsync(q => q.ProjectId == projectId);
        if (qrCode is null)
            return Result.Fail("QR code introuvable.");

        qrCode.ScanCount++;
        qrCode.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result.Ok();
    }
}