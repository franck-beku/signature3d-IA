/**
 * Nouveau Client — Dashboard
 * Version: 3.0 — Connecté au backend PostgreSQL
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { clientsApi, sectorsApi, type SectorDto } from '@/lib/api'

const GOLD = '#d4af37'

const PRIORITES = [
  { value: 1, label: 'Haute',   color: '#f87171' },
  { value: 2, label: 'Moyenne', color: '#facc15' },
  { value: 3, label: 'Normale', color: '#4ade80' },
]

const inputStyle = {
  width: '100%',
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '11px 14px',
  fontSize: '13px',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'var(--font-body)',
  transition: 'border-color 0.2s ease',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: '8px',
}

export default function NouveauClientPage() {
  const router = useRouter()
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [sectors, setSectors]   = useState<SectorDto[]>([])

  const [form, setForm] = useState({
    name:         '',
    sectorId:     '',
    sectorCustom: '',
    email:        '',
    phone:        '',
    contractDate: '',
    deliveryDate: '',
    status:       'Prospect',
    priority:     2,
    notes:        '',
  })

  /* Charger les secteurs depuis le backend */
  useEffect(() => {
    sectorsApi.getAll()
      .then((data) => setSectors(data as SectorDto[]))
      .catch(console.error)
  }, [])

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      /* Si secteur custom — créer ou récupérer le secteur via l'API */
      let sectorId = form.sectorId

      if (!sectorId) {
        setError('Veuillez choisir un secteur.')
        return
      }

      /* Créer le client via l'API */
      await clientsApi.create({
        name:         form.name,
        email:        form.email,
        phone:        form.phone || undefined,
        notes:        form.notes || undefined,
        contractDate: form.contractDate,
        deliveryDate: form.deliveryDate,
        status:       form.status,
        priority:     form.priority,
        sectorId,
      })

      setSaved(true)
      setTimeout(() => router.push('/dashboard/clients'), 2000)
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const isValid =
    form.name &&
    form.sectorId &&
    form.email &&
    form.contractDate &&
    form.deliveryDate

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/dashboard/clients" style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Nouveau client</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              Remplir les informations du client
            </p>
          </div>
        </div>

        <div style={{ padding: '32px 40px', maxWidth: '800px' }}>

          {/* Succès */}
          {saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle size={24} style={{ color: '#4ade80' }} />
              </div>
              <p style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Client créé avec succès</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Redirection vers la liste des clients...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Erreur */}
              {error && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* Infos principales */}
              <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px' }}>
                <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>
                  Informations du client
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid">
                  <div>
                    <label style={labelStyle}>Nom du client *</label>
                    <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Mercedes Québec" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Secteur *</label>
                    <select required value={form.sectorId} onChange={(e) => set('sectorId', e.target.value)} style={inputStyle} className="dash-input">
                      <option value="">Choisir un secteur...</option>
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@client.ca" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone</label>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 (418) 000-0000" style={inputStyle} className="dash-input" />
                  </div>
                </div>
              </div>

              {/* Dates & Statut */}
              <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px' }}>
                <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>
                  Contrat & Priorité
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid">
                  <div>
                    <label style={labelStyle}>Date de contrat *</label>
                    <input type="date" required value={form.contractDate} onChange={(e) => set('contractDate', e.target.value)} style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Date de livraison *</label>
                    <input type="date" required value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Statut</label>
                    <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inputStyle} className="dash-input">
                      <option value="Prospect">Prospect</option>
                      <option value="EnCours">En cours</option>
                      <option value="Actif">Actif</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Priorité</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {PRIORITES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set('priority', p.value)}
                          style={{
                            flex: 1, padding: '10px 8px', borderRadius: '8px',
                            border: `1px solid ${form.priority === p.value ? p.color : 'rgba(255,255,255,0.08)'}`,
                            backgroundColor: form.priority === p.value ? `${p.color}18` : 'transparent',
                            color: form.priority === p.value ? p.color : 'rgba(255,255,255,0.4)',
                            fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px' }}>
                <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>
                  Notes internes
                </h2>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Informations importantes sur ce client — contexte, exigences spéciales, historique..."
                  style={{ ...inputStyle, resize: 'none' }}
                  className="dash-input"
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: isValid && !saving ? GOLD : 'rgba(255,255,255,0.05)',
                    color: isValid && !saving ? '#000' : 'rgba(255,255,255,0.2)',
                    fontSize: '13px', fontWeight: 600,
                    padding: '12px 24px', borderRadius: '8px',
                    border: 'none', cursor: isValid && !saving ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                  className="submit-btn"
                >
                  {saving ? 'Création...' : 'Créer le client'}
                </button>
                <Link href="/dashboard/clients" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', padding: '12px 16px' }}>
                  Annuler
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <style>{`
        .back-arrow:hover { color: ${GOLD} !important; }
        .dash-input:focus { border-color: ${GOLD} !important; }
        .submit-btn:hover:not(:disabled) { background-color: #c9a84c !important; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
