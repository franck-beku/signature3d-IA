/**
 * Secteurs — Dashboard Signature Immersion
 * Gestion CRUD des secteurs (univers) — alimente le site vitrine.
 */

'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, Trash2, Pencil, AlertTriangle, X, Check, Eye, EyeOff } from 'lucide-react'
import { sectorsApi, type SectorDto } from '@/lib/api'

const GOLD = '#d4af37'

const thStyle = {
  textAlign: 'left' as const, padding: '14px 16px',
  fontSize: '11px', textTransform: 'uppercase' as const,
  letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
  fontWeight: 400, borderBottom: '1px solid rgba(255,255,255,0.05)',
  whiteSpace: 'nowrap' as const,
}

const inputStyle = {
  width: '100%', backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'white' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

const labelStyle = {
  display: 'block' as const, fontSize: '11px', color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase' as const, letterSpacing: '0.2em', marginBottom: '6px',
}

interface SectorForm {
  id: string | null   // null = création
  name: string
  description: string
  imageUrl: string
  coverImage: string
  icon: string
  displayOrder: number
  isActive: boolean
}

const emptyForm: SectorForm = {
  id: null, name: '', description: '', imageUrl: '', coverImage: '',
  icon: '', displayOrder: 0, isActive: true,
}

export default function SecteursPage() {
  const [sectors, setSectors]             = useState<SectorDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [form, setForm]                   = useState<SectorForm | null>(null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    sectorsApi.getAll()
      .then((res) => setSectors(res as SectorDto[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setError(null); setForm({ ...emptyForm, displayOrder: sectors.length + 1 }) }

  const openEdit = (s: SectorDto) => {
    setError(null)
    setForm({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      imageUrl: s.imageUrl ?? '',
      coverImage: s.coverImage ?? '',
      icon: s.icon ?? '',
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    })
  }

  const handleSave = async () => {
    if (!form) return
    if (!form.name.trim()) { setError('Le nom est obligatoire.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        coverImage: form.coverImage || undefined,
        icon: form.icon || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      }
      if (form.id) {
        await sectorsApi.update(form.id, payload)
      } else {
        await sectorsApi.create(payload)
      }
      setForm(null)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sectorsApi.delete(id)
      setSectors((prev) => prev.filter((s) => s.id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filtered = sectors
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Secteurs</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              {loading ? '...' : `${sectors.length} secteur${sectors.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} className="new-btn">
            <Plus size={13} /> Nouveau secteur
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && !form && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input type="text" placeholder="Nom, description..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} className="dash-input" />
          </div>

          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Ordre</th>
                    <th style={thStyle}>Secteur</th>
                    <th style={thStyle}>Slug</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Clients</th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const isDeletePending = deleteConfirm === s.id
                    return (
                      <React.Fragment key={s.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none') }} className="client-row">
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{s.displayOrder}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: GOLD, fontSize: '12px', fontWeight: 500 }}>{s.name[0]}</span>
                              </div>
                              <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{s.name}</p>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'monospace' }}>{s.slug}</span></td>
                          <td style={{ padding: '14px 16px', maxWidth: '260px' }}><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '—'}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{s.clientCount}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            {s.isActive
                              ? <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>Actif</span>
                              : <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>Masqué</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button onClick={() => openEdit(s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: `1px solid rgba(212,175,55,0.2)`, color: GOLD, background: 'none', cursor: 'pointer' }} className="edit-btn" title="Modifier">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : s.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isDeletePending && (
                          <tr>
                            <td colSpan={7} style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.05)', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>
                                  Supprimer le secteur <strong>{s.name}</strong> ? {s.clientCount > 0 && 'Des clients y sont rattachés — la suppression sera refusée.'}
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(s.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#f87171', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun secteur trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal Créer / Modifier */}
      {form && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: 0 }}>
                {form.id ? 'Modifier le secteur' : 'Nouveau secteur'}
              </h2>
              <button onClick={() => setForm(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn">
                <X size={14} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nom du secteur *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Automobile" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Description (accroche)</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Présentez chaque véhicule comme s'il était devant votre client." style={inputStyle} className="dash-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Image (vignette)</label>
                  <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={labelStyle}>Image plein écran</label>
                  <input type="text" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={labelStyle}>Icône</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="car" style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={labelStyle}>Ordre d'affichage</label>
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} style={inputStyle} className="dash-input" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Visibilité sur le site</label>
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1a', color: form.isActive ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', width: '100%' }}
                >
                  {form.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.isActive ? 'Actif — visible sur le site' : 'Masqué — invisible sur le site'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
                  <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => setForm(null)} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .new-btn:hover    { background-color: #c9a84c !important; }
        .client-row:hover { background-color: rgba(255,255,255,0.02) !important; }
        .edit-btn:hover   { background-color: rgba(212,175,55,0.1) !important; }
        .del-btn:hover    { background-color: rgba(248,113,113,0.1) !important; }
        .close-btn:hover  { color: white !important; }
        .save-btn:hover   { background-color: #c9a84c !important; }
        .dash-input:focus { border-color: ${GOLD} !important; }
      `}</style>
    </div>
  )
}