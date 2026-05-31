/**
 * Agenda — Dashboard Signature 3D IA
 * Disponibilités + rendez-vous Alain & Franck
 * États vides propres — données réelles après backend
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Calendar, Plus, Clock, User, X } from 'lucide-react'

const GOLD = '#d4af37'

interface Evenement {
  id: string
  titre: string
  date: string
  heure: string
  type: 'disponible' | 'indisponible' | 'client'
  auteur: string
  note?: string
}

const TYPE_STYLE = {
  disponible:   { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80', label: 'Disponible'   },
  indisponible: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', label: 'Indisponible' },
  client:       { bg: 'rgba(212,175,55,0.1)',  color: '#d4af37', label: 'Client'       },
}

export default function AgendaPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [userName, setUserName]     = useState('...')
  const [form, setForm]             = useState({ titre: '', date: '', heure: '', type: 'disponible' as const, note: '' })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUserName(JSON.parse(stored).name)
  }, [])

  const handleAdd = () => {
    if (!form.titre || !form.date) return
    const ev: Evenement = {
      id: Date.now().toString(),
      titre: form.titre, date: form.date,
      heure: form.heure, type: form.type,
      auteur: userName, note: form.note,
    }
    setEvenements((prev) => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
    setForm({ titre: '', date: '', heure: '', type: 'disponible', note: '' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setEvenements((prev) => prev.filter((e) => e.id !== id))
  }

  const inputStyle = { width: '100%', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-body)' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Agenda</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              Disponibilités & rendez-vous
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="new-btn">
            <Plus size={13} />
            Ajouter un événement
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Légende */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(TYPE_STYLE).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: val.color, display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{val.label}</span>
              </div>
            ))}
          </div>

          {/* Formulaire ajout */}
          {showForm && (
            <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginBottom: '20px' }}>Nouvel événement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }} className="form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Titre *</label>
                  <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Rendez-vous Mercedes" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} style={inputStyle}>
                    <option value="disponible">Disponible</option>
                    <option value="indisponible">Indisponible</option>
                    <option value="client">Rendez-vous client</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Heure</label>
                  <input type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Note</label>
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note optionnelle..." style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAdd} disabled={!form.titre || !form.date} style={{ backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                  Ajouter
                </button>
                <button onClick={() => setShowForm(false)} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste événements */}
          {evenements.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Calendar size={24} style={{ color: 'rgba(212,175,55,0.4)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Aucun événement
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', lineHeight: 1.6, maxWidth: '300px' }}>
                Ajoutez vos disponibilités et rendez-vous clients pour coordonner avec votre associé.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {evenements.map((ev) => {
                const style = TYPE_STYLE[ev.type]
                return (
                  <div key={ev.id} style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease' }} className="event-row">
                    <div style={{ width: '4px', height: '40px', borderRadius: '2px', backgroundColor: style.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0 }}>{ev.titre}</p>
                      {ev.note && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '3px 0 0' }}>{ev.note}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{new Date(ev.date).toLocaleDateString('fr-CA')}</span>
                      </div>
                      {ev.heure && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{ev.heure}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{ev.auteur.split(' ')[0]}</span>
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                      <button onClick={() => handleDelete(ev.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', transition: 'all 0.2s ease' }} className="del-btn">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px', textAlign: 'center' }}>
            Les événements seront sauvegardés après l&apos;intégration du backend PostgreSQL.
          </p>
        </div>
      </main>

      <style>{`
        .new-btn:hover { background-color: #c9a84c !important; }
        .event-row:hover { border-color: rgba(212,175,55,0.15) !important; }
        .del-btn:hover { color: #f87171 !important; border-color: rgba(248,113,113,0.3) !important; }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
