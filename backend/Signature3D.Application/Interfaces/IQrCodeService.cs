using Signature3D.Application.Common;
using Signature3D.Application.DTOs.QrCodes;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de génération des QR codes avec logo Signature 3D IA.
/// </summary>
public interface IQrCodeService
{
    Task<Result<QrCodeDto>> GenerateAsync(Guid projectId);
    Task<Result> TrackScanAsync(Guid projectId);
}