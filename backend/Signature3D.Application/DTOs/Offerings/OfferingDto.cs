namespace Signature3D.Application.DTOs.Offerings;

/// <summary>Offre commerciale (Matterport, 360°, IA, etc.).</summary>
public class OfferingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? LongDescription { get; set; }
    public string? LongDescriptionEn { get; set; }
    public string? Icon { get; set; }
    public string? ImageUrl { get; set; }
    public string? Level { get; set; }
    public string? LevelEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>Données pour créer une offre depuis le dashboard.</summary>
public class CreateOfferingDto
{
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? LongDescription { get; set; }
    public string? LongDescriptionEn { get; set; }
    public string? Icon { get; set; }
    public string? ImageUrl { get; set; }
    public string? Level { get; set; }
    public string? LevelEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Données pour modifier une offre existante.</summary>
public class UpdateOfferingDto
{
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ShortDescriptionEn { get; set; }
    public string? LongDescription { get; set; }
    public string? LongDescriptionEn { get; set; }
    public string? Icon { get; set; }
    public string? ImageUrl { get; set; }
    public string? Level { get; set; }
    public string? LevelEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
