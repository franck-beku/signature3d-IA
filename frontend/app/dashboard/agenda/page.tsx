'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, X } from 'lucide-react'
import { agendaApi, type AgendaEventDto, type AgendaEventType, type CreateAgendaEventDto } from '@/lib/api'

const GOLD = '#C8A45D'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const EVENT_TYPES: AgendaEventType[] = [
  'RendezVousCommercial', 'CaptationMatterport', 'Captation360',
  'Livraison', 'Urgent', 'ReunionInterne', 'AppelClient',
  'SuiviClient', 'Presentation', 'Validation', 'Autre',
]

const TYPE_LABELS: Record<AgendaEventType, string> = {
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

const TYPE_COLORS: Record<AgendaEventType, string> = {
  RendezVousCommercial: '#22c55e',
  CaptationMatterport:  '#3b82f6',
  Captation360:         '#06b6d4',
  Livraison:            '#f97316',
  Urgent:               '#ef4444',
  ReunionInterne:       '#6b7280',
  AppelClient:          '#a855f7',
  SuiviClient:          '#eab308',
  Presentation:         '#6366f1',
  Validation:           '#15803d',
  Autre:                '#9ca3af',
}

interface CalEvent {
  title: string
  start: Date
  end: Date
  resource: AgendaEventDto
}

const toCalEvent = (dto: AgendaEventDto): CalEvent => ({
  title: dto.title,
  start: new Date(dto.startDateTime),
  end:   new Date(dto.endDateTime ?? dto.startDateTime),
  resource: dto,
})

const EMPTY_FORM: CreateAgendaEventDto = {
  title: '',
  startDateTime: '',
  endDateTime: '',
  type: 'RendezVousCommercial',
}

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#0d0d0d',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'white',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-body)',
}

export default function AgendaPage() {
  const [events,      setEvents]      = useState<CalEvent[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [form,        setForm]        = useState<CreateAgendaEventDto>(EMPTY_FORM)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await agendaApi.getAll()
      setEvents(data.map(toCalEvent))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title || !form.startDateTime) return
    try {
      setSubmitting(true)
      await agendaApi.create({
        ...form,
        endDateTime: form.endDateTime || undefined,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Agenda</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              Rendez-vous & événements
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="new-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            <Plus size={13} />
            Nouvel événement
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><X size={14} /></button>
            </div>
          )}

          {/* Formulaire création */}
          {showForm && (
            <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 20px' }}>Nouvel événement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Titre *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Rendez-vous Mercedes" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AgendaEventType })} style={inputStyle}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Début *</label>
                  <input type="datetime-local" value={form.startDateTime} onChange={e => setForm({ ...form, startDateTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Fin</label>
                  <input type="datetime-local" value={form.endDateTime ?? ''} onChange={e => setForm({ ...form, endDateTime: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCreate} disabled={!form.title || !form.startDateTime || submitting} style={{ backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Création…' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Calendrier */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid rgba(200,164,93,0.2)`, borderTopColor: GOLD, animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }} className="rbc-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                defaultView={Views.MONTH}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                culture="fr"
                style={{ height: 650 }}
                eventPropGetter={(event) => {
                  const color = TYPE_COLORS[(event as CalEvent).resource.type] ?? GOLD
                  return {
                    style: {
                      backgroundColor: color,
                      borderColor: color,
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '11px',
                    },
                  }
                }}
                messages={{
                  today:    "Aujourd'hui",
                  previous: 'Précédent',
                  next:     'Suivant',
                  month:    'Mois',
                  week:     'Semaine',
                  day:      'Jour',
                  agenda:   'Agenda',
                  noEventsInRange: 'Aucun événement sur cette période.',
                  date:     'Date',
                  time:     'Heure',
                  event:    'Événement',
                }}
              />
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .new-btn:hover { background-color: #b8943d !important; }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }

        /* Intégration dark du calendrier react-big-calendar */
        .rbc-wrapper .rbc-calendar { color: rgba(255,255,255,0.85); }
        .rbc-wrapper .rbc-toolbar button { color: rgba(255,255,255,0.6); background: transparent; border-color: rgba(255,255,255,0.1); }
        .rbc-wrapper .rbc-toolbar button:hover,
        .rbc-wrapper .rbc-toolbar button.rbc-active { background: rgba(200,164,93,0.12); color: #C8A45D; border-color: rgba(200,164,93,0.3); }
        .rbc-wrapper .rbc-toolbar-label { color: white; font-size: 16px; }
        .rbc-wrapper .rbc-month-view,
        .rbc-wrapper .rbc-time-view,
        .rbc-wrapper .rbc-agenda-view { background: transparent; border-color: rgba(255,255,255,0.06); }
        .rbc-wrapper .rbc-header { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; border-color: rgba(255,255,255,0.06); padding: 8px 4px; }
        .rbc-wrapper .rbc-day-bg + .rbc-day-bg,
        .rbc-wrapper .rbc-month-row + .rbc-month-row { border-color: rgba(255,255,255,0.05); }
        .rbc-wrapper .rbc-off-range-bg { background: rgba(255,255,255,0.02); }
        .rbc-wrapper .rbc-today { background: rgba(200,164,93,0.05); }
        .rbc-wrapper .rbc-date-cell { color: rgba(255,255,255,0.5); font-size: 12px; }
        .rbc-wrapper .rbc-date-cell.rbc-now { color: #C8A45D; font-weight: 600; }
        .rbc-wrapper .rbc-event.rbc-selected { opacity: 0.85; }
        .rbc-wrapper .rbc-time-header-content,
        .rbc-wrapper .rbc-time-content { border-color: rgba(255,255,255,0.06); }
        .rbc-wrapper .rbc-timeslot-group { border-color: rgba(255,255,255,0.04); }
        .rbc-wrapper .rbc-time-slot { color: rgba(255,255,255,0.2); font-size: 11px; }
        .rbc-wrapper .rbc-agenda-date-cell,
        .rbc-wrapper .rbc-agenda-time-cell { color: rgba(255,255,255,0.4); font-size: 12px; border-color: rgba(255,255,255,0.05); }
        .rbc-wrapper .rbc-agenda-event-cell { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.05); }
        .rbc-wrapper .rbc-show-more { color: #C8A45D; background: transparent; font-size: 11px; }
      `}</style>
    </div>
  )
}
