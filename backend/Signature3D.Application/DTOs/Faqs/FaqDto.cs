namespace Signature3D.Application.DTOs.Faqs;

/// <summary>Question fréquente (FAQ).</summary>
public class FaqDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string? QuestionEn { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string? AnswerEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}

/// <summary>Données pour créer une FAQ depuis le dashboard.</summary>
public class CreateFaqDto
{
    public string Question { get; set; } = string.Empty;
    public string? QuestionEn { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string? AnswerEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; } = true;
}

/// <summary>Données pour modifier une FAQ existante.</summary>
public class UpdateFaqDto
{
    public string Question { get; set; } = string.Empty;
    public string? QuestionEn { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string? AnswerEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}