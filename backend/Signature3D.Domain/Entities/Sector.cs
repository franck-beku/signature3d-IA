namespace Signature3D.Domain.Entities;

public class Sector : BaseEntity
{
    public string Name { get; set; } = string.Empty;       // Automobile
    public string Slug { get; set; } = string.Empty;       // automobile
    public string? ImageUrl { get; set; }

    /* Navigation */
    public ICollection<Client> Clients { get; set; } = [];
}