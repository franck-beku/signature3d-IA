'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, X } from 'lucide-react'
import {
  agendaApi, clientsApi, projectsApi, contactsApi,
  type AgendaEventDto, type AgendaEventType, type CreateAgendaEventDto,
  type ClientDto, type ProjectDto, type ContactDto,
} from '@/lib/api'

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

function toLocalInput(iso: string): string {
  return iso.slice(0, 16)
}

const EMPTY_FORM: CreateAgendaEventDto = {
  title: '',
  startDateTime: '',
  endDateTime: '',
  type: 'RendezVousCommercial',
  notes: '',
  customType: '',
  clientId: undefined,
  projectId: undefined,
  contactId: undefined,
}

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-body)',
}

const hintStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--dash-text-muted)', margin: '6px 0 0',
}

export default function AgendaPage() {
  const [events,     setEvents]     = useState<CalEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [form,       setForm]       = useState<CreateAgendaEventDto>(EMPTY_FORM)
  const [editingId,  setEditingId]  = useState<string | null>(null)

  const [clients,  setClients]  = useState<ClientDto[]>([])
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [contacts, setContacts] = useState<ContactDto[]>([])

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

  useEffect(() => {
    clientsApi.getAll(1, 1000)
      .then(r => setClients(r.items))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.clientId) { setProjects([]); setContacts([]); return }
    projectsApi.getByClient(form.clientId).then(setProjects).catch(() => setProjects([]))
    contactsApi.getByClient(form.clientId).then(setContacts).catch(() => setContacts([]))
  }, [form.clientId])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSelectEvent = (event: object) => {
    const dto = (event as CalEvent).resource
    setForm({
      title:         dto.title,
      startDateTime: toLocalInput(dto.startDateTime),
      endDateTime:   dto.endDateTime ? toLocalInput(dto.endDateTime) : '',
      type:          dto.type,
      notes:         dto.notes ?? '',
      customType:    dto.customType ?? '',
      clientId:      dto.clientId,
      projectId:     dto.projectId,
      contactId:     dto.contactId,
    })
    setEditingId(dto.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.startDateTime) return
    const payload = {
      ...form,
      endDateTime: form.endDateTime  || undefined,
      customType:  form.type === 'Autre' ? (form.customType || undefined) : undefined,
      clientId:    form.clientId  || undefined,
      projectId:   form.projectId || undefined,
      contactId:   form.contactId || undefined,
    }
    try {
      setSubmitting(true)
      if (editingId) {
        await agendaApi.update(editingId, payload)
      } else {
        await agendaApi.create(payload)
      }
      resetForm()
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingId) return
    if (!window.confirm('Supprimer cet événement ?')) return
    try {
      setSubmitting(true)
      await agendaApi.delete(editingId)
      resetForm()
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
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Agenda</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              Rendez-vous & événements
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="new-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={13} />
            Nouvel événement
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dash-error)', fontSize: '13px' }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-error)' }}><X size={14} /></button>
            </div>
          )}

          {/* Formulaire création / édition */}
          {showForm && (
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ color: 'var(--dash-text)', fontSize: '14px', fontWeight: 500, margin: '0 0 20px' }}>
                {editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h3>

              {/* Ligne 1 : Titre + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Titre *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Rendez-vous Mercedes" style={inputStyle} />
                  <p style={hintStyle}>Ce qui s&apos;affiche dans le calendrier</p>
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AgendaEventType })} style={inputStyle}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                  <p style={hintStyle}>La catégorie de l&apos;événement</p>
                  {form.type === 'Autre' && (
                    <input
                      type="text"
                      value={form.customType ?? ''}
                      onChange={e => setForm({ ...form, customType: e.target.value })}
                      placeholder="Ex: Formation, Maintenance, Audit…"
                      style={{ ...inputStyle, marginTop: '8px' }}
                    />
                  )}
                </div>
              </div>

              {/* Ligne 2 : Début + Fin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Début *</label>
                  <input type="datetime-local" value={form.startDateTime} onChange={e => setForm({ ...form, startDateTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Fin</label>
                  <input type="datetime-local" value={form.endDateTime ?? ''} onChange={e => setForm({ ...form, endDateTime: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Notes — pleine largeur */}
              <div style={{ marginBottom: '14px' }}>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Notes</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Détails, choses à prévoir…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {/* Ligne 3 : Client + Projet */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Client</label>
                  <select
                    value={form.clientId ?? ''}
                    onChange={e => {
                      const clientId = e.target.value || undefined
                      setForm({ ...form, clientId, projectId: undefined, contactId: undefined })
                    }}
                    style={inputStyle}
                  >
                    <option value="">— Aucun —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Projet</label>
                  <select
                    value={form.projectId ?? ''}
                    onChange={e => setForm({ ...form, projectId: e.target.value || undefined })}
                    disabled={!form.clientId}
                    style={{ ...inputStyle, opacity: form.clientId ? 1 : 0.4, cursor: form.clientId ? 'pointer' : 'not-allowed' }}
                  >
                    <option value="">{form.clientId ? '— Aucun —' : "Choisir un client d'abord"}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Ligne 4 : Contact */}
              <div style={{ marginBottom: '20px' }}>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Contact</label>
                <select
                  value={form.contactId ?? ''}
                  onChange={e => setForm({ ...form, contactId: e.target.value || undefined })}
                  disabled={!form.clientId}
                  style={{ ...inputStyle, opacity: form.clientId ? 1 : 0.4, cursor: form.clientId ? 'pointer' : 'not-allowed' }}
                >
                  <option value="">{form.clientId ? '— Aucun —' : "Choisir un client d'abord"}</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.title || !form.startDateTime || submitting}
                    style={{ backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? (editingId ? 'Enregistrement…' : 'Création…') : (editingId ? 'Enregistrer' : 'Créer')}
                  </button>
                  <button
                    onClick={resetForm}
                    style={{ backgroundColor: 'transparent', color: 'var(--dash-text-subtle)', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                </div>

                {editingId && (
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    style={{ backgroundColor: 'transparent', color: 'var(--dash-error)', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--dash-error-ring)', cursor: 'pointer', opacity: submitting ? 0.5 : 1 }}
                    className="del-btn"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Calendrier */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--dash-gold-ring)', borderTopColor: 'var(--dash-gold)', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '20px' }} className="rbc-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                defaultView={Views.MONTH}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                culture="fr"
                style={{ height: 650 }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                  const color = TYPE_COLORS[(event as CalEvent).resource.type] ?? 'var(--dash-gold)'
                  return {
                    style: {
                      backgroundColor: color,
                      borderColor: color,
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
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
        .del-btn:hover { background-color: var(--dash-error-bg) !important; border-color: var(--dash-error) !important; }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }

        /* Intégration light du calendrier react-big-calendar */
        .rbc-wrapper .rbc-calendar { color: var(--dash-text); }
        .rbc-wrapper .rbc-toolbar button { color: var(--dash-text-subtle); background: transparent; border-color: var(--dash-border-input); }
        .rbc-wrapper .rbc-toolbar button:hover,
        .rbc-wrapper .rbc-toolbar button.rbc-active { background: rgba(200,164,93,0.12); color: #C8A45D; border-color: rgba(200,164,93,0.3); }
        .rbc-wrapper .rbc-toolbar-label { color: var(--dash-text); font-size: 16px; }
        .rbc-wrapper .rbc-month-view,
        .rbc-wrapper .rbc-time-view,
        .rbc-wrapper .rbc-agenda-view { background: transparent; border-color: var(--dash-border); }
        .rbc-wrapper .rbc-header { color: var(--dash-text-subtle); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; border-color: var(--dash-border); padding: 8px 4px; }
        .rbc-wrapper .rbc-day-bg + .rbc-day-bg,
        .rbc-wrapper .rbc-month-row + .rbc-month-row { border-color: var(--dash-border); }
        .rbc-wrapper .rbc-off-range-bg { background: var(--dash-hover); }
        .rbc-wrapper .rbc-today { background: rgba(200,164,93,0.05); }
        .rbc-wrapper .rbc-date-cell { color: var(--dash-text-subtle); font-size: 12px; }
        .rbc-wrapper .rbc-date-cell.rbc-now { color: #C8A45D; font-weight: 600; }
        .rbc-wrapper .rbc-event.rbc-selected { opacity: 0.85; }
        .rbc-wrapper .rbc-time-header-content,
        .rbc-wrapper .rbc-time-content { border-color: var(--dash-border); }
        .rbc-wrapper .rbc-timeslot-group { border-color: var(--dash-border); }
        .rbc-wrapper .rbc-time-slot { color: var(--dash-text-muted); font-size: 11px; }
        .rbc-wrapper .rbc-agenda-date-cell,
        .rbc-wrapper .rbc-agenda-time-cell { color: var(--dash-text-subtle); font-size: 12px; border-color: var(--dash-border); }
        .rbc-wrapper .rbc-agenda-event-cell { color: var(--dash-text); border-color: var(--dash-border); }
        .rbc-wrapper .rbc-show-more { color: #C8A45D; background: transparent; font-size: 11px; }
      `}</style>
    </div>
  )
}
