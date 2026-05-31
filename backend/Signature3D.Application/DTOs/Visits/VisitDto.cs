namespace Signature3D.Application.DTOs.Visits;

/// <summary>
/// DTO d'une visite sur une expérience embed.
/// </summary>
public class VisitDto
{
    public Guid Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO pour enregistrer une nouvelle visite depuis l'embed.
/// </summary>
public class CreateVisitDto
{
    public string ProjectSlug { get; set; } = string.Empty;
    public string Source { get; set; } = "DirectLink";
    public string? UserAgent { get; set; }
}