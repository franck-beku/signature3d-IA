using System.Globalization;
using System.Text;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Normalisation de texte partagée — minuscules + suppression des accents (é→e, à→a...) et des
/// apostrophes/tirets (d'ouverture→douverture). No-op sur du texte déjà ASCII sans ponctuation.
/// Utilisée par ProjectStatsService (catégorisation des questions) et ChatService (scoring RAG)
/// pour comparer du texte de façon insensible à la casse, aux accents et à la ponctuation.
/// </summary>
internal static class TextNormalizer
{
    public static string Normalize(string text)
    {
        var decomposed = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark) continue; // accents
            if (c is '\'' or '’' or '-') continue; // apostrophes (droite + typographique) et tirets
            sb.Append(c);
        }
        return sb.ToString();
    }
}
