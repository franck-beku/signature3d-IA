namespace Signature3D.Application.DTOs.Stats;

/// <summary>
/// Nombre de questions visiteur tombées dans une catégorie donnée.
/// </summary>
public class QuestionCategoryStatsDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// Statistiques des questions posées à Luxedia pour un projet, regroupées par catégorie métier
/// (mots-clés bilingues FR/EN) — quatrième métrique du module de reporting client.
/// </summary>
public class ProjectQuestionStatsDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public List<QuestionCategoryStatsDto> Categories { get; set; } = [];

    /// <summary>
    /// Textes bruts des ~50 questions les plus récentes tombées dans "Autre" — sert à repérer
    /// les mots-clés manquants et enrichir le dictionnaire, pas un échec de la catégorisation.
    /// </summary>
    public List<string> UncategorizedQuestions { get; set; } = [];
}
