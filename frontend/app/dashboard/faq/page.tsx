/**
 * FAQ — Dashboard Signature Immersion
 * Gestion CRUD des questions fréquentes du site.
 */

'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, Trash2, Pencil, AlertTriangle, X, Check, Eye, EyeOff } from 'lucide-react'
import { faqApi, type FaqDto } from '@/lib/api'

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

interface FaqForm {
  id: string | null
  question: string
  answer: string
  displayOrder: number
  isPublished: boolean
}

const emptyForm: FaqForm = {
  id: null, question: '', answer: '', displayOrder: 0, isPublished: true,
}

export default function FaqPage() {
  const [faqs, setFaqs]                   = useState<FaqDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [form, setForm]                   = useState<FaqForm | null>(null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    faqApi.getAll()
      .then((res) => setFaqs(res as FaqDto[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setError(null); setForm({ ...emptyForm, displayOrder: faqs.length + 1 }) }

  const openEdit = (f: FaqDto) => {
    setError(null)
    setForm({
      id: f.id,
      question: f.question,
      answer: f.answer,
      displayOrder: f.displayOrder,
      isPublished: f.isPublished,
    })
  }

  const handleSave = async () => {
    if (!form) return
    if (!form.question.trim() || !form.answer.trim()) { setError('La question et la réponse sont obligatoires.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        displayOrder: form.displayOrder,
        isPublished: form.isPublished,
      }
      if (form.id) await faqApi.update(form.id, payload)
      else await faqApi.create(payload)
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
      await faqApi.delete(id)
      setFaqs((prev) => prev.filter((f) => f.id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filtered = faqs
    .filter((f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>FAQ</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              {loading ? '...' : `${faqs.length} question${faqs.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} className="new-btn">
            <Plus size={13} /> Nouvelle question
          </button>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && !form && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>{error}</div>
          )}

          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input type="text" placeholder="Question, réponse..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} className="dash-input" />
          </div>

          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Ordre</th>
                    <th style={thStyle}>Question</th>
                    <th style={thStyle}>Réponse</th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, i) => {
                    const isDeletePending = deleteConfirm === f.id
                    return (
                      <React.Fragment key={f.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none') }} className="client-row">
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{f.displayOrder}</span></td>
                          <td style={{ padding: '14px 16px', maxWidth: '300px' }}><p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{f.question}</p></td>
                          <td style={{ padding: '14px 16px', maxWidth: '360px' }}><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.answer}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            {f.isPublished
                              ? <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>Publiée</span>
                              : <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>Brouillon</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button onClick={() => openEdit(f)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: `1px solid rgba(212,175,55,0.2)`, color: GOLD, background: 'none', cursor: 'pointer' }} className="edit-btn" title="Modifier"><Pencil size={12} /></button>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : f.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                        {isDeletePending && (
                          <tr>
                            <td colSpan={5} style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.05)', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>Supprimer cette question ? Cette action est irréversible.</p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(f.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#f87171', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucune question trouvée</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {form && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: 0 }}>{form.id ? 'Modifier la question' : 'Nouvelle question'}</h2>
              <button onClick={() => setForm(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn"><X size={14} /></button>
            </div>
            {error && (<div style={{ padding: '10px 14px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</div>)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Question *</label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Quelle différence entre 360° et Matterport ?" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Réponse *</label>
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} placeholder="Le 360° permet de présenter un espace avec des vues panoramiques..." style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Visibilité sur le site</label>
                <button onClick={() => setForm({ ...form, isPublished: !form.isPublished })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1a', color: form.isPublished ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
                  {form.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.isPublished ? 'Publiée — visible sur le site' : 'Brouillon — invisible sur le site'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn"><Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                <button onClick={() => setForm(null)} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
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