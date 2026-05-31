namespace Signature3D.Application.DTOs.Chat;

/// <summary>
/// Message envoyé par le visiteur au chatbot Luxedia.
/// </summary>
public class ChatMessageDto
{
    public string Message { get; set; } = string.Empty;
    public string ProjectSlug { get; set; } = string.Empty;
    public string? SessionToken { get; set; }
}

/// <summary>
/// Réponse du chatbot Luxedia.
/// </summary>
public class ChatResponseDto
{
    public string Response { get; set; } = string.Empty;
    public string SessionToken { get; set; } = string.Empty;
    public List<SuggestedButtonDto> Buttons { get; set; } = [];
}

/// <summary>
/// Bouton suggéré dans la réponse du chatbot.
/// </summary>
public class SuggestedButtonDto
{
    public string Label { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string Action { get; set; } = string.Empty;
}