/**
 * ActionButtons — Boutons d'action dans l'embed
 * Version: 4.0 — Tous les boutons actifs + tracking analytics
 */

'use client'

import { analyticsApi } from '@/lib/api'

interface Button {
  label: string
  url: string | null
  action: 'link' | 'form' | 'call'
}

interface Props {
  buttons: Button[]
  projectSlug?: string
}

export default function ActionButtons({ buttons, projectSlug }: Props) {

  const handleClick = async (button: Button) => {
    /* ── Tracker le clic dans analytics ── */
    if (projectSlug) {
      try {
        await analyticsApi.trackEvent('ButtonClick', projectSlug, button.label)
      } catch {
        // Ne jamais bloquer l'action du visiteur
      }
    }

    /* ── Redirection directe ── */
    if (button.url) {
      if (button.action === 'call') {
        window.location.href = button.url
      } else {
        window.open(button.url, '_blank')
      }
    }
  }

  const GOLD = '#d4af37'

  if (!buttons || buttons.length === 0) return null

  return (
    <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textAlign: 'center' }}>
        Actions rapides
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: buttons.length === 1 ? '1fr' : '1fr 1fr', gap: '6px' }}>
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleClick(btn)}
            style={{
              fontSize: '11px', padding: '8px 6px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: '#1a1a1a',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              opacity: 1,
              textAlign: 'center', lineHeight: 1.3,
              transition: 'all 0.2s ease',
            }}
            className="action-quick-btn"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <style>{`
        .action-quick-btn:hover {
          border-color: rgba(212,175,55,0.4) !important;
          color: ${GOLD} !important;
          background-color: rgba(212,175,55,0.05) !important;
        }
      `}</style>
    </div>
  )
}
