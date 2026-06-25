namespace Signature3D.Application.DTOs.Contacts;

public class CreateContactDto
{
    public string Name { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? PhoneExtension { get; set; }
    public bool IsPrimary { get; set; }
}
