/**
 * Témoignages — Dashboard Signature Immersion
 * Version: 1.0 — Thème clair (variables --dash-*), miroir du pattern FAQ
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, Trash2, Pencil, AlertTriangle, X, Check, Eye, EyeOff, Upload } from 'lucide-react'
import { testimonialsApi, uploadApi, type TestimonialAdminDto } from '@/lib/api'

const thStyle = {
  textAlign: 'left' as const, padding: '14px 16px',
  fontSize: '11px', textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', color: 'var(--dash-text-subtle)',
  fontWeight: 500, borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

const labelStyle = {
  display: 'block' as const, fontSize: '11px', color: 'var(--dash-text-subtle)',
  textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px',
  fontWeight: 500,
}

interface TestimonialForm {
  id: string | null
  name: string
  company: string
  companyEn: string
  quote: string
  quoteEn: string
  photoUrl: string
  gender: 'Homme' | 'Femme' | ''
  displayOrder: number
  isPublished: boolean
}

const emptyForm: TestimonialForm = {
  id: null, name: '', company: '', companyEn: '', quote: '', quoteEn: '', photoUrl: '', gender: '', displayOrder: 0, isPublished: false,
}

export default function TemoignagesPage() {
  const [testimonials, setTestimonials]   = useState<TestimonialAdminDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [form, setForm]                   = useState<TestimonialForm | null>(null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [uploading, setUploading]         = useState(false)
  const [isDragging, setIsDragging]       = useState(false)
  const [uploadError, setUploadError]     = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    testimonialsApi.getAll()
      .then((res) => setTestimonials(res as TestimonialAdminDto[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setError(null); setForm({ ...emptyForm, displayOrder: testimonials.length + 1 }) }

  const openEdit = (t: TestimonialAdminDto) => {
    setError(null)
    setForm({
      id: t.id,
      name: t.name,
      company: t.company ?? '',
      companyEn: t.companyEn ?? '',
      quote: t.quote,
      quoteEn: t.quoteEn ?? '',
      photoUrl: t.photoUrl ?? '',
      gender: t.gender ?? '',
      displayOrder: t.displayOrder,
      isPublished: t.isPublished,
    })
  }

  const handleSave = async () => {
    if (!form) return
    if (!form.name.trim() || !form.quote.trim()) { setError('Le nom et la citation sont obligatoires.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        company: form.company || undefined,
        companyEn: form.companyEn || undefined,
        quote: form.quote,
        quoteEn: form.quoteEn || undefined,
        photoUrl: form.photoUrl || undefined,
        gender: form.gender || undefined,
        displayOrder: form.displayOrder,
        isPublished: form.isPublished,
      }
      if (form.id) await testimonialsApi.update(form.id, payload)
      else await testimonialsApi.create(payload)
      setForm(null)
      load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!form) return
    if (!/\.(jpe?g|png)$/i.test(file.name)) {
      setUploadError('Seuls les fichiers JPEG et PNG sont acceptés.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Le fichier ne doit pas dépasser 5 MB.')
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const { url } = await uploadApi.image(file, 'testimonials')
      setForm((prev) => (prev ? { ...prev, photoUrl: url } : prev))
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await testimonialsApi.delete(id)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
      setDeleteConfirm(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const filtered = testimonials
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      t.quote.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--dash-text)', margin: 0 }}>Témoignages</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              {loading ? '...' : `${testimonials.length} témoignage${testimonials.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} className="new-btn">
            <Plus size={13} /> Nouveau témoignage
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && !form && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>{error}</div>
          )}

          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
            <input type="text" placeholder="Nom, entreprise, citation..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} className="dash-input" />
          </div>

          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Ordre</th>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Entreprise</th>
                    <th style={thStyle}>Citation</th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const isDeletePending = deleteConfirm === t.id
                    return (
                      <React.Fragment key={t.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none') }} className="client-row">
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{t.displayOrder}</span></td>
                          <td style={{ padding: '14px 16px' }}><p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{t.name}</p></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{t.company || '—'}</span></td>
                          <td style={{ padding: '14px 16px', maxWidth: '360px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.quote}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            {t.isPublished
                              ? <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'var(--dash-success-bg)', color: 'var(--dash-success)' }}>Publié</span>
                              : <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'var(--dash-border)', color: 'var(--dash-text-subtle)' }}>Masqué</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button onClick={() => openEdit(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn" title="Modifier"><Pencil size={12} /></button>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : t.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                        {isDeletePending && (
                          <tr>
                            <td colSpan={6} style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', borderBottom: i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
                                <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Supprimer ce témoignage ? Cette action est irréversible.</p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(t.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun témoignage trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {form && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>{form.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h2>
              <button onClick={() => setForm(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn"><X size={14} /></button>
            </div>
            {error && (<div style={{ padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Marie Tremblay" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Entreprise / titre</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Concession Automobile XYZ" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Entreprise / titre (EN)</label>
                <input type="text" value={form.companyEn} onChange={(e) => setForm({ ...form, companyEn: e.target.value })} placeholder="XYZ Car Dealership" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Citation *</label>
                <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} placeholder="Signature Immersion a transformé notre façon de présenter nos véhicules..." style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Citation (EN)</label>
                <textarea value={form.quoteEn} onChange={(e) => setForm({ ...form, quoteEn: e.target.value })} rows={4} placeholder="Signature Immersion has transformed the way we present our vehicles..." style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>URL de la photo</label>
                <input type="text" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://... (ou uploadez ci-dessous)" style={inputStyle} className="dash-input" />

                {uploadError && (
                  <p style={{ color: 'var(--dash-error)', fontSize: '12px', margin: '8px 0 0' }}>{uploadError}</p>
                )}

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) handlePhotoUpload(file)
                  }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    marginTop: '10px',
                    border: `1.5px dashed ${isDragging ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
                    borderRadius: '10px', padding: '18px', textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                    backgroundColor: isDragging ? 'var(--dash-gold-muted)' : 'transparent',
                    opacity: uploading ? 0.6 : 1,
                  }}
                  className="photo-upload-zone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file)
                      e.target.value = ''
                    }}
                    style={{ display: 'none' }}
                  />
                  <Upload size={18} style={{ color: uploading ? 'rgba(200,164,93,0.3)' : 'rgba(200,164,93,0.7)', margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', margin: 0 }}>
                    {uploading ? 'Upload en cours...' : <>Glissez une image ici ou <span style={{ color: 'var(--dash-gold)' }}>parcourez</span> — JPEG/PNG, max 5 MB</>}
                  </p>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Genre</label>
                <p style={{ fontSize: '11px', color: 'var(--dash-text-muted)', margin: '0 0 8px' }}>
                  Information interne, jamais visible sur le site public — sert uniquement à choisir l'illustration de secours si aucune photo n'est fournie.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['', 'Homme', 'Femme'] as const).map((g) => (
                    <button
                      key={g || 'none'}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      style={{
                        flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                        border: `1px solid ${form.gender === g ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
                        backgroundColor: form.gender === g ? 'var(--dash-gold-muted)' : 'var(--dash-input)',
                        color: form.gender === g ? 'var(--dash-gold)' : 'var(--dash-text-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      {g === '' ? 'Non renseigné' : g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Visibilité sur le site</label>
                <button onClick={() => setForm({ ...form, isPublished: !form.isPublished })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-input)', color: form.isPublished ? 'var(--dash-success)' : 'var(--dash-text-subtle)', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
                  {form.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.isPublished ? 'Publié — visible sur le site' : 'Masqué — invisible sur le site'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn"><Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                <button onClick={() => setForm(null)} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .new-btn:hover    { background-color: #b8943d !important; }
        .client-row:hover { background-color: var(--dash-hover) !important; }
        .edit-btn:hover   { background-color: var(--dash-gold-muted) !important; }
        .del-btn:hover    { background-color: var(--dash-error-bg) !important; }
        .close-btn:hover  { color: var(--dash-text) !important; }
        .save-btn:hover   { background-color: #b8943d !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
        .photo-upload-zone:hover { border-color: var(--dash-gold-ring) !important; }
      `}</style>
    </div>
  )
}
