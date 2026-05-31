namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de notifications temps réel via Supabase Realtime.
/// Notifie le dashboard quand un visiteur arrive ou un lead est soumis.
/// </summary>
public interface IRealtimeService
{
    Task NotifyNewVisitAsync(Guid projectId);
    Task NotifyNewLeadAsync(Guid projectId, string leadName);
}