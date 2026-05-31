using Signature3D.Domain.Enums;

namespace Signature3D.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? MatterportId { get; set; }       // vide = IA seule
    public string? ThumbnailUrl { get; set; }
    public string AmbassadorName { get; set; } = "Luxedia";
    public string? WelcomeMessage { get; set; }
    public string? LeadEmail { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public string? Notes { get; set; }

    /* Relations */
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public ICollection<ProjectButton> Buttons { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<Lead> Leads { get; set; } = [];
    public ICollection<Visit> Visits { get; set; } = [];
    public ICollection<ChatSession> ChatSessions { get; set; } = [];
    public ICollection<AnalyticsEvent> AnalyticsEvents { get; set; } = [];
    public QrCode? QrCode { get; set; }
}