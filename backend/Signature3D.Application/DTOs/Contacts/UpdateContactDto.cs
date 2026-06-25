namespace Signature3D.Application.DTOs.Contacts;

public class UpdateContactDto
{
    public string? Name { get; set; }
    public string? Position { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? PhoneExtension { get; set; }
    public bool? IsPrimary { get; set; }
}
