using Signature3D.Application.Interfaces;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Implémentation temporaire du service realtime.
/// Sera remplacé par SupabaseRealtimeService quand Supabase Realtime sera configuré.
/// </summary>
public class NullRealtimeService : IRealtimeService
{
    public Task NotifyNewVisitAsync(Guid projectId)
    {
        Console.WriteLine($"[Realtime simulé] Nouvelle visite sur {projectId}");
        return Task.CompletedTask;
    }

    public Task NotifyNewLeadAsync(Guid projectId, string leadName)
    {
        Console.WriteLine($"[Realtime simulé] Nouveau lead {leadName} sur {projectId}");
        return Task.CompletedTask;
    }
}