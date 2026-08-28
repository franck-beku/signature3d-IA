'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

/**
 * Error boundary du segment /embed — capture les pannes techniques (backend indisponible,
 * réseau, 5xx) que app/embed/[slug]/page.tsx laisse volontairement se propager plutôt que
 * de les avaler. Distinct de not-found.tsx : un visiteur ne doit jamais confondre une panne
 * passagère avec un lien mort.
 */
export default function EmbedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[embed] Panne technique :', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0d0d0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center',
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
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
        Problème technique temporaire
      </p>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0, maxWidth: '320px' }}>
        L&apos;expérience n&apos;a pas pu être chargée. Veuillez réessayer dans un instant.
      </p>
      <button
        onClick={() => unstable_retry()}
        style={{
          marginTop: '4px', backgroundColor: '#d4af37', color: '#000',
          fontSize: '13px', fontWeight: 600, padding: '10px 22px',
          borderRadius: '10px', border: 'none', cursor: 'pointer',
        }}
      >
        Réessayer
      </button>
    </div>
  )
}
