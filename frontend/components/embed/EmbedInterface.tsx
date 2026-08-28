/**
 * EmbedInterface — Signature Immersion
 * Version: 5.0 — choix du viewer selon experienceType (Matterport / Tour360 / IAOnly)
 *                + tracking des visites (create au montage + updateDuration au départ)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import MatterportViewer from './MatterportViewer'
import Tour360Viewer from './Tour360Viewer'
import AmbassadeurIA from './AmbassadeurIA'
import { visitsApi } from '@/lib/api'

interface Button {
  label: string
  labelEn?: string | null
  url: string | null
  action: 'link' | 'form' | 'call'
}

interface Suggestion {
  id: string
  label: string
  labelEn?: string | null
  answer?: string | null
  answerEn?: string | null
  order: number
}

interface EmbedInterfaceProps {
  matterportId:   string
  projectName:    string
  ambassadorName: string
  welcomeMessage: string
  welcomeMessageEn?: string
  buttons:        Button[]
  suggestions?:   Suggestion[]
  projectSlug?:   string  // slug du projet pour l'API chat Groq + tracking visites
  experienceType?: string // 'Matterport' | 'Tour360' | 'IAOnly'
  experienceUrl?:  string | null // URL iframe pour Tour360 (Glo3D, etc.)
  luxediaAvatarUrl?:       string
  luxediaClientLogoUrl?:   string
  luxediaPrimaryColor?:    string
  luxediaWidgetBgColor?:   string
  luxediaBotMessageColor?: string
  luxediaUserMessageColor?: string
  luxediaLanguage?:        string
  luxediaEnabled?:         boolean // false = widget désactivé (défaut true, rétro-compatible)
  mode?: string // 'widget' = iframe compacte pilotée par le script d'amorçage (voir public/luxedia-widget.js)
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
  welcomeMessage, welcomeMessageEn, buttons, suggestions, projectSlug,
  experienceType, experienceUrl,
  luxediaAvatarUrl, luxediaClientLogoUrl,
  luxediaPrimaryColor, luxediaWidgetBgColor,
  luxediaBotMessageColor, luxediaUserMessageColor,
  luxediaLanguage, luxediaEnabled, mode,
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
      .then((visit) => {
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

  /* ── Choix du viewer ──
     Priorité : experienceType fait foi (jamais la présence des champs — un projet IAOnly
     peut conserver un ancien matterportId/experienceUrl désactivé, cf. réversibilité dashboard).
     Repli défensif : si experienceType est absent ou pointe vers un champ requis manquant
     (donnée legacy malformée), on retombe sur IA seule plutôt que d'afficher un viewer cassé. */
  const hasTour360    = experienceType === 'Tour360' && !!experienceUrl?.trim()
  const hasMatterport = experienceType === 'Matterport' && !!matterportId?.trim()
  const isIAOnly       = experienceType === 'IAOnly' || (!hasTour360 && !hasMatterport)

  /* ── Widget Luxedia visible aux côtés de la visite ──
     Piloté par le flag explicite du projet, indépendamment de la présence d'une
     visite. undefined → true (rétro-compatible tant que le backend ne l'envoie pas). */
  const showLuxediaWidget = luxediaEnabled !== false

  /* ── Mode widget — signal de branding vers le script d'amorçage du site client ──
     Le script (public/luxedia-widget.js) ne doit jamais appeler notre API lui-même ; c'est
     cette page, chargée dans SA PROPRE iframe sur notre domaine, qui lui transmet la couleur/
     l'avatar réels du projet via postMessage, pour que la bulle flottante soit à l'identité du
     client dès son affichage. '*' est nécessaire ici (le site hôte peut être n'importe quel
     domaine, inconnu à l'avance) — les données transmises sont déjà publiques (mêmes
     informations que /api/embeds/{slug}), aucune donnée sensible n'est en jeu. */
  useEffect(() => {
    if (mode !== 'widget' || typeof window === 'undefined' || window.parent === window) return
    window.parent.postMessage(
      showLuxediaWidget
        ? { type: 'luxedia:ready', ambassadorName, primaryColor: luxediaPrimaryColor ?? null, avatarUrl: luxediaAvatarUrl ?? null }
        : { type: 'luxedia:disabled' },
      '*'
    )
  }, [mode, showLuxediaWidget, ambassadorName, luxediaPrimaryColor, luxediaAvatarUrl])

  /* ── Mode widget — rendu ──
     Contenant minimal : AmbassadeurIA occupe 100% de l'iframe créée par le script hôte.
     Aucune bulle, aucun bouton de fermeture ici — c'est la responsabilité du script sur le
     site client, hors de cette page. Si Luxedia est désactivée, rien à afficher : le script
     a déjà reçu 'luxedia:disabled' ci-dessus et ne montrera jamais la bulle. */
  if (mode === 'widget') {
    if (!showLuxediaWidget) return null
    return (
      <div style={{ position: 'fixed', inset: 0 }}>
        <AmbassadeurIA
          ambassadorName={ambassadorName}
          welcomeMessage={welcomeMessage}
          welcomeMessageEn={welcomeMessageEn}
          buttons={buttons}
          suggestions={suggestions}
          projectSlug={projectSlug}
          luxediaAvatarUrl={luxediaAvatarUrl}
          luxediaClientLogoUrl={luxediaClientLogoUrl}
          luxediaPrimaryColor={luxediaPrimaryColor}
          luxediaWidgetBgColor={luxediaWidgetBgColor}
          luxediaBotMessageColor={luxediaBotMessageColor}
          luxediaUserMessageColor={luxediaUserMessageColor}
          language={luxediaLanguage as 'fr' | 'en' | undefined}
        />
      </div>
    )
  }

  /* ── IA seule — "Salon centré" ──
     Luxedia comme expérience principale : sur desktop, un panneau cadré (largeur/hauteur
     maximales, marge de respiration, fond travaillé) plutôt qu'un simple agrandissement
     du chat à toute la fenêtre. Sur mobile, le panneau redevient plein écran (aucune
     marge, aucun cadrage) — voir la media query plus bas.
     Le header dédié précédent (avatar+nom+statut) a été retiré : AmbassadeurIA rend déjà
     son propre header complet (avatar, nom, statut, sélecteur FR/EN, logo) — le conserver
     ici en plus créait un doublon visuel. */
  if (isIAOnly) {
    const standaloneBg = luxediaWidgetBgColor ?? '#0d0d0d'
    return (
      <div
        className="embed-standalone-stage"
        style={{
          position: 'fixed', inset: 0, backgroundColor: standaloneBg,
          backgroundImage: `radial-gradient(ellipse at center, ${luxediaPrimaryColor ?? '#d4af37'}14 0%, transparent 60%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '5vh 24px', boxSizing: 'border-box',
        }}
      >
        <div
          className="embed-standalone-panel"
          style={{
            width: '100%', maxWidth: '760px', height: 'min(84vh, 860px)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          }}
        >
          <AmbassadeurIA
            ambassadorName={ambassadorName}
            welcomeMessage={welcomeMessage}
            welcomeMessageEn={welcomeMessageEn}
            buttons={buttons}
            suggestions={suggestions}
            projectSlug={projectSlug}
            luxediaAvatarUrl={luxediaAvatarUrl}
            luxediaClientLogoUrl={luxediaClientLogoUrl}
            luxediaPrimaryColor={luxediaPrimaryColor}
            luxediaWidgetBgColor={luxediaWidgetBgColor}
            luxediaBotMessageColor={luxediaBotMessageColor}
            luxediaUserMessageColor={luxediaUserMessageColor}
            language={luxediaLanguage as 'fr' | 'en' | undefined}
          />
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @media (max-width: 767px) {
            .embed-standalone-stage { padding: 0 !important; }
            .embed-standalone-panel {
              max-width: none !important; height: 100% !important;
              border-radius: 0 !important; border: none !important; box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    )
  }

  /* ── Visite immersive (Matterport OU Tour360) + IA — interface 80/20 ── */
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', backgroundColor: '#000', overflow: 'hidden' }}>

      {/* Viewer immersif — 80% */}
      <div style={{ position: 'relative', flex: 1 }}>
        {hasTour360 ? (
          <Tour360Viewer experienceUrl={experienceUrl!} projectName={projectName} />
        ) : (
          <MatterportViewer matterportId={matterportId} projectName={projectName} />
        )}
      </div>

      {/* Ambassadeur IA — 340px desktop */}
      {showLuxediaWidget && (
        <div style={{ width: '340px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex' }} className="embed-sidebar">
          <AmbassadeurIA
            ambassadorName={ambassadorName}
            welcomeMessage={welcomeMessage}
            welcomeMessageEn={welcomeMessageEn}
            buttons={buttons}
            suggestions={suggestions}
            projectSlug={projectSlug}
            luxediaAvatarUrl={luxediaAvatarUrl}
            luxediaClientLogoUrl={luxediaClientLogoUrl}
            luxediaPrimaryColor={luxediaPrimaryColor}
            luxediaWidgetBgColor={luxediaWidgetBgColor}
            luxediaBotMessageColor={luxediaBotMessageColor}
            luxediaUserMessageColor={luxediaUserMessageColor}
            language={luxediaLanguage as 'fr' | 'en' | undefined}
          />
        </div>
      )}

      {/* Mobile — bouton flottant */}
      {showLuxediaWidget && (
        <button
          onClick={() => setIsMobileAIOpen(true)}
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '56px', height: '56px', borderRadius: '50%', backgroundColor: luxediaPrimaryColor ?? '#d4af37', border: `1px solid ${luxediaPrimaryColor ?? '#d4af37'}80`, display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${luxediaPrimaryColor ?? '#d4af37'}66`, cursor: 'pointer' }}
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
      )}

      {/* Mobile — panel IA plein écran */}
      {showLuxediaWidget && isMobileAIOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: '#111', display: 'flex', flexDirection: 'column' }} className="embed-mobile-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: luxediaPrimaryColor ?? '#d4af37', fontSize: '14px', fontWeight: 500 }}>{ambassadorName}</span>
            <button onClick={() => setIsMobileAIOpen(false)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AmbassadeurIA
              ambassadorName={ambassadorName}
              welcomeMessage={welcomeMessage}
              welcomeMessageEn={welcomeMessageEn}
              buttons={buttons}
              suggestions={suggestions}
              projectSlug={projectSlug}
              luxediaAvatarUrl={luxediaAvatarUrl}
              luxediaClientLogoUrl={luxediaClientLogoUrl}
              luxediaPrimaryColor={luxediaPrimaryColor}
              luxediaWidgetBgColor={luxediaWidgetBgColor}
              luxediaBotMessageColor={luxediaBotMessageColor}
              luxediaUserMessageColor={luxediaUserMessageColor}
              language={luxediaLanguage as 'fr' | 'en' | undefined}
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