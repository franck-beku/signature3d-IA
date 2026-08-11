using System.Text.Json.Serialization;
using Signature3D.Domain.Enums;

namespace Signature3D.Application.DTOs.Testimonials;

/// <summary>
/// Témoignage client — route PUBLIQUE (GET /api/testimonials/published).
/// AvatarUrl est déjà résolu côté serveur (vraie photo, ou illustration de secours selon
/// le genre, ou null) : ce type n'a volontairement aucun champ Gender, pour qu'il soit
/// structurellement impossible d'exposer cette information interne au site public.
/// </summary>
public class TestimonialDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? AvatarUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}

/// <summary>
/// Témoignage client — routes DASHBOARD uniquement (GET /api/testimonials/all,
/// GET /api/testimonials/by-id/{id}), toutes deux [Authorize]. Contient le PhotoUrl brut
/// (pour préremplir le champ d'édition) et le Gender interne (pour le sélecteur du
/// formulaire) — jamais retourné par la route publique.
/// </summary>
public class TestimonialAdminDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TestimonialGender? Gender { get; set; }

    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}

/// <summary>Données pour créer un témoignage depuis le dashboard.</summary>
public class CreateTestimonialDto
{
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TestimonialGender? Gender { get; set; }

    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; } = false;
}

/// <summary>Données pour modifier un témoignage existant.</summary>
public class UpdateTestimonialDto
{
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TestimonialGender? Gender { get; set; }

    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}
