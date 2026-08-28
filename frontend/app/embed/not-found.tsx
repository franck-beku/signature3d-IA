/**
 * Not-found du segment /embed — couvre /embed/[slug] (slug inexistant ou projet non publié,
 * volontairement indistinguables ici : EmbedsController renvoie la même réponse pour les deux).
 * Présentation reprise telle quelle de l'ancien état inline de app/embed/[slug]/page.tsx.
 */
export default function EmbedNotFound() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0d0d0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: 'rgba(212,175,55,0.1)',
        border: '1px solid rgba(212,175,55,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
        Expérience introuvable
      </p>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
        Le lien que vous avez utilisé n&apos;est pas valide.
      </p>
    </div>
  )
}
