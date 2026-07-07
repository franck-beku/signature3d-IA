'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { TimelineItemDto } from '@/lib/api'

const AGENDA_TYPE_LABELS: Record<string, string> = {
  RendezVousCommercial: 'Rendez-vous commercial',
  CaptationMatterport:  'Captation 3D Matterport',
  Captation360:         'Captation 360°',
  Livraison:            'Livraison du projet',
  Urgent:               'Urgent',
  ReunionInterne:       'Réunion interne',
  AppelClient:          'Appel client',
  SuiviClient:          'Suivi client',
  Presentation:         'Présentation du projet',
  Validation:           'Validation client',
  Autre:                'Autre',
}

// Couleurs fonctionnelles de catégorie timeline — inchangées
function getCategoryColor(type: string) {
  if (type === 'EvenementAgenda') return '#22c55e'
  if (['LuxediaConfigure','BaseConnaissancesAlimentee','PremierePublicationBaseIA',
       'PremiereConversationLuxedia','IAPrete'].includes(type)) return '#a855f7'
  return '#3b82f6'
}

function formatTimelineDate(item: TimelineItemDto) {
  const d = new Date(item.date)
  if (item.type === 'EvenementAgenda') {
    return format(d, "d MMM yyyy', 'HH'h'mm", { locale: fr })
  }
  return format(d, 'd MMM yyyy', { locale: fr })
}

/* ── Parcours du client (timeline) ── */
export default function ClientTimelineSection({ timeline }: { timeline: TimelineItemDto[] }) {
  return (
    <div>
      <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '20px' }}>Parcours du client</h2>
      {timeline.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucun événement dans l&apos;historique</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          <div style={{ position: 'absolute', left: '7px', top: '6px', bottom: '6px', width: '1px', backgroundColor: 'var(--dash-border)' }} />
          {timeline.map((item, i) => {
            const color = getCategoryColor(item.type)
            const shadowRgb = color === '#22c55e' ? '34,197,94' : color === '#a855f7' ? '168,85,247' : '59,130,246'
            const desc = item.type === 'EvenementAgenda' && item.description
              ? (AGENDA_TYPE_LABELS[item.description] ?? item.description)
              : item.description
            return (
              <div key={i} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? '20px' : 0 }}>
                <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 0 3px rgba(${shadowRgb},0.15)` }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--dash-text-muted)', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatTimelineDate(item)}</span>
                  <span style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500 }}>{item.title}</span>
                </div>
                {desc && <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: '3px 0 0' }}>{desc}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
