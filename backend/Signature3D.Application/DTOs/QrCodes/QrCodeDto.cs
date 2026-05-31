namespace Signature3D.Application.DTOs.QrCodes;

/// <summary>
/// DTO d'un QR code généré pour un projet.
/// </summary>
public class QrCodeDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string TargetUrl { get; set; } = string.Empty;
    public int ScanCount { get; set; }
    public DateTime CreatedAt { get; set; }
}