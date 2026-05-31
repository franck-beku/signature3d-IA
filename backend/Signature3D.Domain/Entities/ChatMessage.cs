namespace Signature3D.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public string Role { get; set; } = "user";      // user | assistant
    public string Content { get; set; } = string.Empty;

    /* Relations */
    public Guid ChatSessionId { get; set; }
    public ChatSession ChatSession { get; set; } = null!;
}