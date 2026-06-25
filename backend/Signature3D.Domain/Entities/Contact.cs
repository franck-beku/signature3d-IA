namespace Signature3D.Domain.Entities;

public class Contact : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? PhoneExtension { get; set; }
    public bool IsPrimary { get; set; } = false;

    // Relation — ClientId requis
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
}
