/**
 * EmbedInterface — Signature 3D IA
 * Version: 4.0 — tracking des visites (create au montage + updateDuration au départ)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import MatterportViewer from './MatterportViewer'
import AmbassadeurIA from './AmbassadeurIA'
import { visitsApi } from '@/lib/api'

interface Button {
  label: string
  url: string | null
  action: 'link' | 'form' | 'call'
}

interface EmbedInterfaceProps {
  matterportId:   string
  projectName:    string
  ambassadorName: string
  welcomeMessage: string
  buttons:        Button[]
  projectSlug?:   string  // slug du projet pour l'API chat Groq + tracking visites
}

/**
 * Mappe le paramètre d'URL ?src= vers une valeur exacte de l'enum VisitSource (backend).
 * ⚠️ La casse doit correspondre EXACTEMENT aux membres de l'enum, sinon le backend
 *    tombe silencieusement sur "Unknown" (Enum.TryParse sensible à la casse).
 *    Valeurs valides : DirectLink | QrCode | Iframe | Unknown
 */
function resolveSource(): string {
  if (typeof window === 'undefined') return 'DirectLink'
  const src = new URLSearchParams(window.location.search).get('src')
  switch (src) {
    case 'qr':     return 'QrCode'
    case 'iframe': return 'Iframe'
    default:       return 'DirectLink'
  }
}

export default function EmbedInterface({
  matterportId, projectName, ambassadorName,
  welcomeMessage, buttons, projectSlug
}: EmbedInterfaceProps) {
  const [isMobileAIOpen, setIsMobileAIOpen] = useState(false)

  /* ── Tracking des visites ──
     - create() au montage (une seule fois, guard contre le double-montage Strict Mode)
     - updateDuration() au départ via visibilitychange (fiable sur mobile)
     Le tracking est silencieux : aucune erreur ne doit perturber l'expérience visiteur. */
  const visitIdRef    = useRef<string | null>(null)
  const startTimeRef  = useRef<number>(Date.now())
  const hasTrackedRef = useRef<boolean>(false)
  const durationSentRef = useRef<boolean>(false)

  useEffect(() => {
    // Pas de slug → impossible de tracker (le backend résout la visite par slug)
    if (!projectSlug) return
    // Guard : éviter le double-call (re-render + double-montage Strict Mode en dev)
    if (hasTrackedRef.current) return
    hasTrackedRef.current = true

    startTimeRef.current = Date.now()

    // 1) Enregistrer la visite
    visitsApi
      .create(projectSlug, resolveSource())
      .then((visit: any) => {
        if (visit && visit.id) visitIdRef.current = visit.id
      })
      .catch(() => { /* silencieux — ne pas perturber le visiteur */ })

    // 2) Envoyer la durée au départ
    const sendDuration = () => {
      if (durationSentRef.current) return
      if (!visitIdRef.current) return
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000)
      if (seconds <= 0) return
      durationSentRef.current = true
      visitsApi
        .updateDuration(visitIdRef.current, seconds)
        .catch(() => { /* silencieux */ })
    }

    // visibilitychange : déclenché quand l'onglet passe en arrière-plan / l'app mobile est fermée.
    // Plus fiable que beforeunload sur mobile (où beforeunload est souvent ignoré).
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') sendDuration()
    }
    document.addEventListener('visibilitychange', onVisibility)
    // Filet de sécurité desktop
    window.addEventListener('pagehide', sendDuration)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', sendDuration)
    }
  }, [projectSlug])

  /* ── IA seule — matterportId vide → chatbot plein écran ── */
  const isIAOnly = !matterportId || matterportId.trim() === ''

  if (isIAOnly) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
              <line x1="11" y1="2" x2="11" y2="11" stroke="#d4af37" strokeWidth="0.8"/>
              <line x1="2" y1="7" x2="11" y2="11" stroke="#d4af37" strokeWidth="0.8"/>
              <line x1="20" y1="7" x2="11" y2="11" stroke="#d4af37" strokeWidth="0.8"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: 600, margin: 0 }}>{ambassadorName}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{projectName}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 500 }}>En ligne</span>
          </div>
        </div>

        {/* Chatbot plein écran */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AmbassadeurIA
            ambassadorName={ambassadorName}
            welcomeMessage={welcomeMessage}
            buttons={buttons}
            projectSlug={projectSlug}
          />
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    )
  }

  /* ── Matterport + IA — interface 80/20 ── */
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', backgroundColor: '#000', overflow: 'hidden' }}>

      {/* Matterport — 80% */}
      <div style={{ position: 'relative', flex: 1 }}>
        <MatterportViewer matterportId={matterportId} projectName={projectName} />
      </div>

      {/* Ambassadeur IA — 340px desktop */}
      <div style={{ width: '340px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex' }} className="embed-sidebar">
        <AmbassadeurIA
          ambassadorName={ambassadorName}
          welcomeMessage={welcomeMessage}
          buttons={buttons}
          projectSlug={projectSlug}
        />
      </div>

      {/* Mobile — bouton flottant */}
      <button
        onClick={() => setIsMobileAIOpen(true)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#d4af37', border: '1px solid rgba(212,175,55,0.5)', display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(212,175,55,0.4)', cursor: 'pointer' }}
        className="embed-mobile-btn"
        aria-label="Ouvrir l'assistant IA"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#0a0a0a" strokeWidth="1.5" fill="none"/>
          <line x1="11" y1="2" x2="11" y2="11" stroke="#0a0a0a" strokeWidth="0.8"/>
          <line x1="2" y1="7" x2="11" y2="11" stroke="#0a0a0a" strokeWidth="0.8"/>
          <line x1="20" y1="7" x2="11" y2="11" stroke="#0a0a0a" strokeWidth="0.8"/>
        </svg>
      </button>

      {/* Mobile — panel IA plein écran */}
      {isMobileAIOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: '#111', display: 'flex', flexDirection: 'column' }} className="embed-mobile-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#d4af37', fontSize: '14px', fontWeight: 500 }}>{ambassadorName}</span>
            <button onClick={() => setIsMobileAIOpen(false)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AmbassadeurIA
              ambassadorName={ambassadorName}
              welcomeMessage={welcomeMessage}
              buttons={buttons}
              projectSlug={projectSlug}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .embed-sidebar { display: none !important; }
          .embed-mobile-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .embed-mobile-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}