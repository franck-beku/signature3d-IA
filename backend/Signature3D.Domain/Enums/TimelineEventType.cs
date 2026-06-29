namespace Signature3D.Domain.Enums;

public enum TimelineEventType
{
    // ── Alimentés (Phase 6B) ──
    ClientCree,
    ContratSigne,
    LivraisonPrevue,
    ContactAjoute,
    ProjetCree,
    ProjetPublie,
    EvenementAgenda,
    PremierLead,

    // ── Réservés (phases futures) ──
    LuxediaConfigure,
    BaseConnaissancesAlimentee,
    PremierePublicationBaseIA,
    PremiereConversationLuxedia,
    IAPrete,
}
