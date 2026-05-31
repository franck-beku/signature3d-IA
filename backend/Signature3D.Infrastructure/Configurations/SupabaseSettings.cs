namespace Signature3D.Infrastructure.Configurations;

/// <summary>
/// Paramètres Supabase pour la base de données PostgreSQL et le storage.
/// </summary>
public class SupabaseSettings
{
    public string Url { get; set; } = string.Empty;
    public string AnonKey { get; set; } = string.Empty;
    public string ServiceRoleKey { get; set; } = string.Empty;
    public string ConnectionString { get; set; } = string.Empty;
}