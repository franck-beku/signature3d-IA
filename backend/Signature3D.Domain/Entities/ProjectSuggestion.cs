namespace Signature3D.Domain.Entities;

/// <summary>
/// Suggestion rapide affichée sous le message d'accueil du widget Luxedia
/// (remplace les 4 boutons codés en dur "Caractéristiques/Prix/Garantie/Disponibilité").
/// Si Answer est renseigné, la suggestion affiche cette réponse directement
/// au lieu d'interroger l'IA (RAG).
/// </summary>
public class ProjectSuggestion : BaseEntity
{
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? Answer { get; set; }
    public string? AnswerEn { get; set; }
    public int Order { get; set; } = 0;

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
