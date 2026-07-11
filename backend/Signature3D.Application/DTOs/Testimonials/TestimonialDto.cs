namespace Signature3D.Application.DTOs.Testimonials;

/// <summary>Témoignage client.</summary>
public class TestimonialDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}

/// <summary>Données pour créer un témoignage depuis le dashboard.</summary>
public class CreateTestimonialDto
{
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; } = false;
}

/// <summary>Données pour modifier un témoignage existant.</summary>
public class UpdateTestimonialDto
{
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? CompanyEn { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string? QuoteEn { get; set; }
    public string? PhotoUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}
