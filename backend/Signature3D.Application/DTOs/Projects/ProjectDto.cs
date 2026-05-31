namespace Signature3D.Application.DTOs.Projects;

/// <summary>
/// DTO complet d'un projet avec ses boutons.
/// </summary>
public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string AmbassadorName { get; set; } = string.Empty;
    public string? WelcomeMessage { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string EmbedUrl { get; set; } = string.Empty;
    public List<ProjectButtonDto> Buttons { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Bouton d'action configurable du chatbot.
/// </summary>
public class ProjectButtonDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string Action { get; set; } = "link";
    public int Order { get; set; }
}

/// <summary>
/// DTO pour créer un nouveau projet depuis le dashboard.
/// </summary>
public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string AmbassadorName { get; set; } = "Luxedia";
    public string? WelcomeMessage { get; set; }
    public string? LeadEmail { get; set; }
    public Guid ClientId { get; set; }
    public List<CreateButtonDto> Buttons { get; set; } = [];
}

/// <summary>
/// DTO pour modifier un projet existant.
/// </summary>
public class UpdateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? MatterportId { get; set; }
    public string AmbassadorName { get; set; } = string.Empty;
    public string? WelcomeMessage { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<CreateButtonDto> Buttons { get; set; } = [];
}

/// <summary>
/// DTO pour créer un bouton.
/// </summary>
public class CreateButtonDto
{
    public string Label { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string Action { get; set; } = "link";
    public int Order { get; set; }
}