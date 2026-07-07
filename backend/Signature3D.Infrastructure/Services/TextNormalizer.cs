using System.Globalization;
using System.Text;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Normalisation de texte partagée — minuscules + suppression des accents (é→e, à→a...).
/// No-op sur du texte déjà ASCII. Utilisée par ProjectStatsService (catégorisation des
/// questions) et ChatService (scoring RAG) pour comparer du texte de façon insensible
/// à la casse et aux accents.
/// </summary>
internal static class TextNormalizer
{
    public static string Normalize(string text)
    {
        var decomposed = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString();
    }
}
