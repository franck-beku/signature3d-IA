namespace Signature3D.Domain.Entities;

public class ChatSession : BaseEntity
{
    public string SessionToken { get; set; } = Guid.NewGuid().ToString();

    /* Relations */
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public ICollection<ChatMessage> Messages { get; set; } = [];
}