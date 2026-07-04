using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? MatterportId { get; set; }       // vide = IA seule
    public ExperienceType ExperienceType { get; set; } = ExperienceType.Matterport;
    public string? ExperienceUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string AmbassadorName { get; set; } = "Luxedia";
    public string? WelcomeMessage { get; set; }
    public string? WelcomeMessageEn { get; set; }
    public string? LeadEmail { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public string? Notes { get; set; }

    /* === Luxedia config === */
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

    /* ── Champs V2 (vitrine) ── */
    public string? ShortDescription { get; set; }    // description courte (galerie)
    public string? ShortDescriptionEn { get; set; }   // traduction anglaise (nullable — repli sur ShortDescription si absente)
    public string? CoverImage { get; set; }          // image de couverture (galerie)
    public bool IsPublished { get; set; }            // visible sur le site (défaut false → accord client requis)
    public DateTime? PublishedAt { get; set; }       // date de première publication (conservée si dépublié)
    public bool IsFeatured { get; set; }             // mis en avant sur l'accueil
    public int DisplayOrder { get; set; }            // ordre d'affichage

    /* Relations */
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;

    /* ── Relations V2 (nullables pour ne pas casser l'existant) ── */
    public Guid? SectorId { get; set; }              // secteur du projet (pilote la vitrine)
    public Sector? Sector { get; set; }
    public Guid? OfferingId { get; set; }            // type de service (pour le filtre)
    public Offering? Offering { get; set; }

    public ICollection<ProjectButton> Buttons { get; set; } = [];
    public ICollection<ProjectSuggestion> Suggestions { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<Lead> Leads { get; set; } = [];
    public ICollection<Visit> Visits { get; set; } = [];
    public ICollection<ChatSession> ChatSessions { get; set; } = [];
    public ICollection<AnalyticsEvent> AnalyticsEvents { get; set; } = [];
    public ICollection<ProjectDetail> Details { get; set; } = [];
    public QrCode? QrCode { get; set; }
}