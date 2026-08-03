namespace Signature3D.Application.DTOs.Projects;

/// <summary>
/// DTO complet d'un projet avec ses boutons et son contexte V2.
/// </summary>
public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string ExperienceType { get; set; } = "Matterport";
    public string? ExperienceUrl { get; set; } 
    public string? ThumbnailUrl { get; set; }
    public string AmbassadorName { get; set; } = string.Empty;
    public string? WelcomeMessage { get; set; }
    public string? WelcomeMessageEn { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public string EmbedUrl { get; set; } = string.Empty;

    /* Champs V2 */
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? CoverImage { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public Guid? SectorId { get; set; }
    public string? SectorName { get; set; }
    public Guid? OfferingId { get; set; }
    public string? OfferingName { get; set; }

    /* === Luxedia config === */
    public bool LuxediaEnabled { get; set; } = true;
    public string? LuxediaAvatarUrl { get; set; }
    public string? LuxediaClientLogoUrl { get; set; }
    public string? LuxediaPrimaryColor { get; set; }
    public string? LuxediaWidgetBgColor { get; set; }
    public string? LuxediaBotMessageColor { get; set; }
    public string? LuxediaUserMessageColor { get; set; }
    public string? LuxediaWidgetPosition { get; set; }
    public string? LuxediaButtonIcon { get; set; }
    public string? LuxediaLanguage { get; set; }
    public string? LuxediaTone { get; set; }
    public string? LuxediaPersonalityInstructions { get; set; }

    public List<ProjectButtonDto> Buttons { get; set; } = [];
    public List<ProjectSuggestionDto> Suggestions { get; set; } = [];
    public List<ProjectDetailDto> Details { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO pour créer un nouveau projet depuis le dashboard.
/// </summary>
public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string ExperienceType { get; set; } = "Matterport";
    public string? ExperienceUrl { get; set; }
    public string AmbassadorName { get; set; } = "Luxedia";
    public string? WelcomeMessage { get; set; }
    public string? WelcomeMessageEn { get; set; }
    public string? Notes { get; set; }
    public string? LeadEmail { get; set; }
    public Guid ClientId { get; set; }

    /* Champs V2 */
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? CoverImage { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public Guid? SectorId { get; set; }
    public Guid? OfferingId { get; set; }

    /* === Luxedia config === */
    public bool LuxediaEnabled { get; set; } = true;
    public string? LuxediaAvatarUrl { get; set; }
    public string? LuxediaClientLogoUrl { get; set; }
    public string? LuxediaPrimaryColor { get; set; }
    public string? LuxediaWidgetBgColor { get; set; }
    public string? LuxediaBotMessageColor { get; set; }
    public string? LuxediaUserMessageColor { get; set; }
    public string? LuxediaWidgetPosition { get; set; }
    public string? LuxediaButtonIcon { get; set; }
    public string? LuxediaLanguage { get; set; }
    public string? LuxediaTone { get; set; }
    public string? LuxediaPersonalityInstructions { get; set; }

    public List<CreateButtonDto> Buttons { get; set; } = [];
    public List<CreateSuggestionDto> Suggestions { get; set; } = [];
    public List<CreateDetailDto> Details { get; set; } = [];
}

/// <summary>
/// DTO pour modifier un projet existant.
/// </summary>
public class UpdateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string ExperienceType { get; set; } = "Matterport"; 
    public string? ExperienceUrl { get; set; } 
    public string AmbassadorName { get; set; } = string.Empty;
    public string? WelcomeMessage { get; set; }
    public string? WelcomeMessageEn { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;

    /* Champs V2 */
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? CoverImage { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public Guid? SectorId { get; set; }
    public Guid? OfferingId { get; set; }

    /* === Luxedia config === */
    public bool LuxediaEnabled { get; set; }
    public string? LuxediaAvatarUrl { get; set; }
    public string? LuxediaClientLogoUrl { get; set; }
    public string? LuxediaPrimaryColor { get; set; }
    public string? LuxediaWidgetBgColor { get; set; }
    public string? LuxediaBotMessageColor { get; set; }
    public string? LuxediaUserMessageColor { get; set; }
    public string? LuxediaWidgetPosition { get; set; }
    public string? LuxediaButtonIcon { get; set; }
    public string? LuxediaLanguage { get; set; }
    public string? LuxediaTone { get; set; }
    public string? LuxediaPersonalityInstructions { get; set; }

    public List<CreateButtonDto> Buttons { get; set; } = [];
    public List<CreateSuggestionDto> Suggestions { get; set; } = [];
    public List<CreateDetailDto> Details { get; set; } = [];
}

/// <summary>
/// Bouton d'action configurable du chatbot.
/// </summary>
public class ProjectButtonDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? Url { get; set; }
    public string Action { get; set; } = "link";
    public int Order { get; set; }
}





/// <summary>
/// DTO pour créer un bouton.
/// </summary>
public class CreateButtonDto
{
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? Url { get; set; }
    public string Action { get; set; } = "link";
    public int Order { get; set; }
}

/// <summary>
/// Suggestion rapide du widget Luxedia (remplace les 4 boutons codés en dur).
/// </summary>
public class ProjectSuggestionDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? Answer { get; set; }
    public string? AnswerEn { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// DTO pour créer une suggestion.
/// </summary>
public class CreateSuggestionDto
{
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? Answer { get; set; }
    public string? AnswerEn { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// DTO public léger pour la vitrine (page Réalisations).
/// Ne contient que ce qu'un visiteur doit voir — pas de données internes
/// (leads, analytics, documents, client interne).
/// </summary>
public class ProjectCardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;          // sert à construire /embed/{slug}
    public string? CoverImage { get; set; }
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? MatterportId { get; set; } 
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }

    /* Contexte secteur / offre (pour les libellés et le filtre) */
    public string? SectorName { get; set; }
    public string? SectorSlug { get; set; }
    public string? OfferingName { get; set; }                  // "Matterport + IA"
    public string? OfferingSlug { get; set; }                  // "matterport-ia" → filtre
    public List<ProjectDetailDto> Details { get; set; } = [];
}

/// <summary>
/// Caractéristique personnalisée d'un projet (Prix, Kilométrage, Superficie...).
/// </summary>
public class ProjectDetailDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; }
}

/// <summary>Caractéristique fournie depuis le dashboard (création/édition).</summary>
public class CreateDetailDto
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; } = true;
}

