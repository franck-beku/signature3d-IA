'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, X, Check } from 'lucide-react'
import {
  agendaApi, clientsApi, projectsApi, contactsApi,
  type AgendaEventDto, type CreateAgendaEventDto,
  type ClientDto, type ProjectDto, type ContactDto,
} from '@/lib/api'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

/* Palette fixe — 6 couleurs, cohérentes avec l'identité visuelle du dashboard (l'or reprend
   l'accent principal --dash-gold). Remplace TYPE_COLORS : la couleur d'un rendez-vous est
   désormais choisie librement par l'utilisateur, indépendamment du Type technique (conservé
   en base pour compatibilité mais retiré du formulaire). */
const AGENDA_COLORS = [
  { value: '#d4af37', label: 'Or' },
  { value: '#22c55e', label: 'Émeraude' },
  { value: '#3b82f6', label: 'Azur' },
  { value: '#ef4444', label: 'Corail' },
  { value: '#a855f7', label: 'Violet' },
  { value: '#6b7280', label: 'Ardoise' },
] as const
const DEFAULT_AGENDA_COLOR = AGENDA_COLORS[0].value

interface CalEvent {
  title: string
  start: Date
  end: Date
  resource: AgendaEventDto
}

// Un rendez-vous est un instant, pas une plage : react-big-calendar a néanmoins besoin d'un
// intervalle start/end pour calculer la hauteur d'un événement dans les vues Semaine/Jour.
// On ne réutilise JAMAIS endDateTime (données historiques à +7 jours possibles) — seulement
// une durée visuelle technique fixe, jamais persistée, jamais demandée à l'utilisateur, et
// bornée à la fin de la journée pour ne jamais produire un événement à cheval sur deux jours.
const VISUAL_EVENT_DURATION_MS = 30 * 60 * 1000

const toCalEvent = (dto: AgendaEventDto): CalEvent => {
  const start = new Date(dto.startDateTime)
  const endOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999)
  const end = new Date(Math.min(start.getTime() + VISUAL_EVENT_DURATION_MS, endOfDay.getTime()))
  return { title: dto.title, start, end, resource: dto }
}

// UTC (reçu de l'API, ex. "2026-08-26T19:30:00Z") → composantes LOCALES du navigateur,
// au format attendu par <input type="datetime-local">. `format` (date-fns) lit les
// composantes locales de l'objet Date — jamais toISOString(), qui reviendrait en UTC.
function toLocalInput(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
}

// Valeur locale d'un <input type="datetime-local"> (ex. "2026-08-26T15:30", sans fuseau)
// → véritable instant UTC. new Date(valeur-sans-fuseau) interprète nativement cette chaîne
// comme une heure locale du navigateur ; toISOString() convertit ensuite correctement en UTC
// (aucun décalage codé en dur, DST géré automatiquement par le moteur JS).
function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

const EMPTY_FORM: CreateAgendaEventDto = {
  title: '',
  startDateTime: '',
  endDateTime: '',
  type: 'RendezVousCommercial',
  notes: '',
  customType: '',
  color: DEFAULT_AGENDA_COLOR,
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

// Vue Mois : react-big-calendar n'affiche que le titre par défaut — on ajoute l'heure et un
// repère visuel pour obtenir "● 14:00 Titre" sans toucher aux vues Semaine/Jour (déjà lisibles
// via leur propre grille horaire).
function MonthEvent({ event }: { event: CalEvent }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#fff', flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {format(event.start, 'HH:mm')} {event.title}
      </span>
    </span>
  )
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
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

  // "Prochains rendez-vous" — dérivé des événements déjà chargés en mémoire (events),
  // aucun appel API supplémentaire. Passés exclus ici uniquement pour cette colonne ;
  // ils restent visibles normalement dans le calendrier (events n'est pas filtré).
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter(e => e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [events])

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
      color:         dto.color || DEFAULT_AGENDA_COLOR,
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
      startDateTime: localInputToIso(form.startDateTime),
      endDateTime: form.endDateTime ? localInputToIso(form.endDateTime) : undefined,
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
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

              {/* Ligne 1 : Titre */}
              <div style={{ marginBottom: '14px' }}>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Titre *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Présentation Mercedes" style={inputStyle} />
                <p style={hintStyle}>Ce qui s&apos;affiche dans le calendrier</p>
              </div>

              {/* Ligne 2 : Date et heure + Couleur */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Date et heure *</label>
                  <input type="datetime-local" value={form.startDateTime} onChange={e => setForm({ ...form, startDateTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Couleur</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '38px' }}>
                    {AGENDA_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setForm({ ...form, color: c.value })}
                        title={c.label}
                        aria-label={c.label}
                        aria-pressed={form.color === c.value}
                        style={{
                          width: '26px', height: '26px', borderRadius: '50%', backgroundColor: c.value,
                          border: form.color === c.value ? '2px solid var(--dash-text)' : '2px solid transparent',
                          boxShadow: form.color === c.value ? `0 0 0 2px ${c.value}55` : 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, flexShrink: 0,
                        }}
                      >
                        {form.color === c.value && <Check size={13} color="#fff" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
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

          {/* Calendrier | Prochains rendez-vous */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--dash-gold-ring)', borderTopColor: 'var(--dash-gold)', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }} className="agenda-layout">
              <div style={{ flex: 1, minWidth: 0, backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '20px' }} className="rbc-wrapper">
                <Calendar
                  localizer={localizer}
                  events={events}
                  defaultView={Views.MONTH}
                  views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                  culture="fr"
                  style={{ height: 650 }}
                  popup
                  onSelectEvent={handleSelectEvent}
                  components={{ month: { event: MonthEvent } }}
                  eventPropGetter={(event: CalEvent) => {
                    const color = event.resource.color || DEFAULT_AGENDA_COLOR
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

              {/* Prochains rendez-vous — dérivé de `events`, aucun appel API dédié */}
              <div
                className="agenda-upcoming"
                style={{
                  width: '300px', flexShrink: 0, backgroundColor: 'var(--dash-surface)',
                  border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)',
                  borderRadius: '14px', padding: '20px', maxHeight: '650px',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: '0 0 16px' }}>
                  Prochains rendez-vous
                </h2>
                {upcomingEvents.length === 0 ? (
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>
                    Aucun rendez-vous à venir.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                    {upcomingEvents.map((event, i) => {
                      const dto = event.resource
                      return (
                        <button
                          key={dto.id}
                          onClick={() => handleSelectEvent(event)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left',
                            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
                            borderTop: i === 0 ? 'none' : '1px solid var(--dash-border)', width: '100%',
                          }}
                          className="upcoming-row"
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dto.color || DEFAULT_AGENDA_COLOR, marginTop: '5px', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0, textTransform: 'capitalize' }}>
                              {format(event.start, 'd MMM', { locale: fr })} · {format(event.start, 'HH:mm')}
                            </p>
                            <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {dto.title}
                            </p>
                            {(dto.clientName || dto.projectName) && (
                              <p style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {[dto.clientName, dto.projectName].filter(Boolean).join(' — ')}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .new-btn:hover { background-color: #b8943d !important; }
        .del-btn:hover { background-color: var(--dash-error-bg) !important; border-color: var(--dash-error) !important; }
        .upcoming-row:hover { background-color: var(--dash-hover); border-radius: 8px; }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }
        /* Tablette/mobile : Calendrier puis Prochains rendez-vous empilés, jamais compressés côte à côte */
        @media (max-width: 900px) {
          .agenda-layout { flex-direction: column; }
          .agenda-upcoming { width: 100% !important; max-height: 360px !important; }
        }

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
