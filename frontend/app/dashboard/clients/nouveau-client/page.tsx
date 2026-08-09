/**
 * Nouveau Client — Dashboard
 * Version: 3.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { clientsApi, sectorsApi, type SectorDto } from '@/lib/api'
import { getPriority } from '@/lib/priority'

const PRIORITES = [3, 2, 1].map((v) => ({ value: v, ...getPriority(v) }))

const AUTRE_SECTEUR = '__autre__'

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)',
  borderRadius: '8px',
  padding: '11px 14px',
  fontSize: '13px',
  color: 'var(--dash-text)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'var(--font-body)',
  transition: 'border-color 0.2s ease',
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
    phoneExt:     '',
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
      let sectorId = form.sectorId

      if (!sectorId) {
        setError('Veuillez choisir un secteur.')
        return
      }

      if (sectorId === AUTRE_SECTEUR) {
        if (!form.sectorCustom.trim()) {
          setError('Veuillez préciser le secteur.')
          return
        }
        // Crée un secteur à la volée pour ce nom personnalisé — inactif par défaut
        // (n'apparaît pas sur le site public tant qu'il n'est pas activé manuellement).
        const newSector = await sectorsApi.create({
          name:         form.sectorCustom.trim(),
          displayOrder: sectors.length,
          isActive:     false,
        })
        sectorId = newSector.id
      }

      const phone = form.phone
        ? (form.phoneExt.trim() ? `${form.phone} poste ${form.phoneExt.trim()}` : form.phone)
        : undefined

      await clientsApi.create({
        name:         form.name,
        email:        form.email,
        phone,
        notes:        form.notes || undefined,
        contractDate: form.contractDate,
        deliveryDate: form.deliveryDate,
        status:       form.status,
        priority:     form.priority,
        sectorId,
      })

      setSaved(true)
      setTimeout(() => router.push('/dashboard/clients'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const isValid =
    form.name &&
    form.sectorId &&
    (form.sectorId !== AUTRE_SECTEUR || form.sectorCustom.trim()) &&
    form.email &&
    form.contractDate &&
    form.deliveryDate

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <Link href="/dashboard/clients" style={{ color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Nouveau client</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              Remplir les informations du client
            </p>
          </div>
        </div>

        <div style={{ padding: '32px 40px', maxWidth: '800px' }}>

          {/* Succès */}
          {saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--dash-success-bg)', border: '1px solid var(--dash-success-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle size={24} style={{ color: 'var(--dash-success)' }} />
              </div>
              <p style={{ color: 'var(--dash-text)', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Client créé avec succès</p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Redirection vers la liste des clients...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Erreur */}
              {error && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* Infos principales */}
              <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px' }}>
                <h2 className="dash-label" style={{ marginBottom: '20px' }}>
                  Informations du client
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid">
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom du client *</label>
                    <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Mercedes Québec" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Secteur *</label>
                    <select required value={form.sectorId} onChange={(e) => set('sectorId', e.target.value)} style={inputStyle} className="dash-input">
                      <option value="">Choisir un secteur...</option>
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                      <option value={AUTRE_SECTEUR}>Autre</option>
                    </select>
                    {form.sectorId === AUTRE_SECTEUR && (
                      <input
                        type="text"
                        required
                        value={form.sectorCustom}
                        onChange={(e) => set('sectorCustom', e.target.value)}
                        placeholder="Précisez le secteur"
                        style={{ ...inputStyle, marginTop: '8px' }}
                        className="dash-input"
                      />
                    )}
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@client.ca" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Téléphone</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 (418) 000-0000" style={{ ...inputStyle, flex: 1 }} className="dash-input" />
                      <input type="text" value={form.phoneExt} onChange={(e) => set('phoneExt', e.target.value)} placeholder="Poste" style={{ ...inputStyle, flex: '0 0 90px' }} className="dash-input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates & Statut */}
              <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px' }}>
                <h2 className="dash-label" style={{ marginBottom: '20px' }}>
                  Contrat & Priorité
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid">
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Date de contrat *</label>
                    <input type="date" required value={form.contractDate} onChange={(e) => set('contractDate', e.target.value)} style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Date de livraison *</label>
                    <input type="date" required value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Statut</label>
                    <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inputStyle} className="dash-input">
                      <option value="Prospect">Prospect</option>
                      <option value="EnCours">En cours</option>
                      <option value="Actif">Actif</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Priorité</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {PRIORITES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set('priority', p.value)}
                          style={{
                            flex: 1, padding: '10px 8px', borderRadius: '8px',
                            border: `1px solid ${form.priority === p.value ? p.color : 'var(--dash-border-input)'}`,
                            backgroundColor: form.priority === p.value ? p.bgColor : 'transparent',
                            color: form.priority === p.value ? p.color : 'var(--dash-text-subtle)',
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
              <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px' }}>
                <h2 className="dash-label" style={{ marginBottom: '20px' }}>
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
                    backgroundColor: isValid && !saving ? 'var(--dash-gold)' : 'var(--dash-border)',
                    color: isValid && !saving ? '#000' : 'var(--dash-text-muted)',
                    fontSize: '13px', fontWeight: 600,
                    padding: '12px 24px', borderRadius: '8px',
                    border: 'none', cursor: isValid && !saving ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                  className="submit-btn"
                >
                  {saving ? 'Création...' : 'Créer le client'}
                </button>
                <Link href="/dashboard/clients" style={{ fontSize: '13px', color: 'var(--dash-text-muted)', textDecoration: 'none', padding: '12px 16px' }}>
                  Annuler
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <style>{`
        .back-arrow:hover { color: var(--dash-gold) !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
        .submit-btn:hover:not(:disabled) { background-color: #b8943d !important; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
