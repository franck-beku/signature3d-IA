namespace Signature3D.Domain.Enums;

/// <summary>
/// Genre du client dans un témoignage — sert uniquement à choisir l'illustration de
/// secours (silhouette) quand aucune photo n'est fournie. Jamais exposé sur les routes
/// publiques : voir TestimonialDto (public) vs TestimonialAdminDto (dashboard).
/// </summary>
public enum TestimonialGender
{
    Homme,
    Femme
}
