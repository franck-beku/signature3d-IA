using Signature3D.Application.Common;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Provider OCR — extrait le texte d'une image (page PDF rastérisée) quand l'extraction
/// texte normale échoue (encadré/visuel sans calque texte).
/// </summary>
public interface IOcrProvider
{
    /// <summary>Extrait le texte visible dans une image (PNG/JPEG).</summary>
    Task<Result<string>> ExtractTextFromImageAsync(byte[] imageBytes);
}
