/**
 * Nouveau Projet — Dashboard
 * Version: 3.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2 } from 'lucide-react'
import { clientsApi, projectsApi, type ClientDto } from '@/lib/api'

/* ─── Types ─── */
interface Bouton { id: string; label: string; url: string; action: 'link' | 'form' | 'call' }

interface FormData {
  name:           string
  type:           'matterport_ia' | 'ia_seule' | 'matterport'
  matterportUrl:  string
  ambassadorName: string
  welcomeMessage: string
  leadEmail:      string
  boutons:        Bouton[]
  notes:          string
}

/* ─── Config ─── */
const TYPES_PROJET = [
  { value: 'matterport_ia', label: 'Matterport + IA',  desc: 'Visite 3D immersive avec chatbot Luxedia' },
  { value: 'ia_seule',      label: 'IA seule',          desc: 'Chatbot Luxedia sans visite 3D'           },
  { value: 'matterport',    label: 'Matterport seul',   desc: 'Visite 3D sans chatbot IA'                },
]

const TYPES_ACTION = [
  { value: 'link',  label: 'Lien URL'   },
  { value: 'call',  label: 'Téléphone'  },
  { value: 'form',  label: 'Formulaire' },
]

const steps = [
  { id: 1, label: 'Type'       },
  { id: 2, label: 'Infos'      },
  { id: 3, label: 'Matterport' },
  { id: 4, label: 'IA'         },
  { id: 5, label: 'Résultat'   },
]

/* ─── Styles ─── */
const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '10px',
  padding: '12px 16px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.3s ease',
}
const cardStyle = {
  backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
  borderRadius: '14px', padding: '24px',
}
const btnGold = {
  display: 'flex', alignItems: 'center', gap: '8px',
  backgroundColor: 'var(--dash-gold)', color: '#000',
  fontSize: '13px', fontWeight: 600, padding: '11px 24px',
  borderRadius: '10px', border: 'none', cursor: 'pointer',
  transition: 'all 0.2s ease',
}
const btnOutline = {
  display: 'flex', alignItems: 'center', gap: '8px',
  border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)',
  fontSize: '13px', padding: '11px 24px', borderRadius: '10px',
  background: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
}

function getMatterportId(url: string): string | null {
  const m = url.match(/[?&]m=([^&]+)/)
  if (m) return m[1]
  if (url.length > 5 && !url.includes('/') && !url.includes(' ')) return url
  return null
}

function newBouton(): Bouton {
  return { id: Date.now().toString(), label: '', url: '', action: 'link' }
}

export default function NouveauProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating]   = useState(false)
  const [created, setCreated]         = useState(false)
  const [createdSlug, setCreatedSlug] = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [client, setClient]           = useState<ClientDto | null>(null)

  const [form, setForm] = useState<FormData>({
    name:           '',
    type:           'matterport_ia',
    matterportUrl:  '',
    ambassadorName: 'Luxedia',
    welcomeMessage: '',
    leadEmail:      '',
    boutons:        [newBouton()],
    notes:          '',
  })

  useEffect(() => {
    clientsApi.getBySlug(slug)
      .then((c) => setClient(c as ClientDto))
      .catch(console.error)
  }, [slug])

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateBouton = (id: string, key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      boutons: prev.boutons.map((b) => b.id === id ? { ...b, [key]: value } : b),
    }))

  const addBouton = () => {
    if (form.boutons.length >= 4) return
    setForm((prev) => ({ ...prev, boutons: [...prev.boutons, newBouton()] }))
  }

  const removeBouton = (id: string) => {
    if (form.boutons.length <= 1) return
    setForm((prev) => ({ ...prev, boutons: prev.boutons.filter((b) => b.id !== id) }))
  }

  const handleCreate = async () => {
    if (!client) { setError('Client introuvable.'); return }
    setIsCreating(true)
    setError(null)

    try {
      const matterportId = getMatterportId(form.matterportUrl)

      const result = await projectsApi.create({
        name:          form.name,
        matterportId:  form.type !== 'ia_seule' ? (matterportId ?? undefined) : undefined,
        ambassadorName: form.ambassadorName,
        welcomeMessage: form.welcomeMessage || undefined,
        leadEmail:     form.leadEmail || undefined,
        clientId:      client.id,
        buttons:       form.type !== 'matterport'
          ? form.boutons.map((b, i) => ({
              label:  b.label,
              url:    b.url || undefined,
              action: b.action,
              order:  i,
            }))
          : [],
        suggestions: [],
      })

      setCreatedSlug(result.slug)
      setCreated(true)
      setCurrentStep(5)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setIsCreating(false)
    }
  }

  const needsMatterport = form.type !== 'ia_seule'
  const matterportId    = getMatterportId(form.matterportUrl)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <Link href={`/dashboard/clients/${slug}`} style={{ color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Nouveau projet</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              {client ? client.name : 'Chargement...'} — Configuration en {steps.length} étapes
            </p>
          </div>
        </div>

        <div style={{ padding: '28px 40px', maxWidth: '720px' }}>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: index < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 500, transition: 'all 0.3s ease',
                    backgroundColor: currentStep > step.id ? 'var(--dash-success)' : currentStep === step.id ? 'var(--dash-gold)' : 'var(--dash-input)',
                    color: currentStep >= step.id ? '#000' : 'var(--dash-text-muted)',
                    border: currentStep >= step.id ? 'none' : '1px solid var(--dash-border-input)',
                  }}>
                    {currentStep > step.id ? <Check size={14} /> : step.id}
                  </div>
                  <p style={{ fontSize: '10px', marginTop: '6px', whiteSpace: 'nowrap', color: currentStep === step.id ? 'var(--dash-gold)' : 'var(--dash-text-muted)' }}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div style={{ flex: 1, height: '1px', margin: '0 8px', marginBottom: '16px', backgroundColor: currentStep > step.id ? 'var(--dash-success-ring)' : 'var(--dash-border-input)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Erreur globale */}
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* ── ÉTAPE 1 — Type ── */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Type de projet</h2>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '24px' }}>Choisissez l&apos;expérience à livrer au client.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {TYPES_PROJET.map((t) => (
                    <button key={t.value} type="button" onClick={() => set('type', t.value)}
                      style={{ padding: '16px 20px', borderRadius: '12px', textAlign: 'left', border: `1px solid ${form.type === t.value ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`, backgroundColor: form.type === t.value ? 'var(--dash-gold-muted)' : 'var(--dash-input)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px' }}
                      className="type-btn"
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${form.type === t.value ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`, backgroundColor: form.type === t.value ? 'var(--dash-gold)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {form.type === t.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }} />}
                      </div>
                      <div>
                        <p style={{ color: form.type === t.value ? 'var(--dash-gold)' : 'var(--dash-text)', fontSize: '14px', fontWeight: 600, margin: '0 0 3px' }}>{t.label}</p>
                        <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setCurrentStep(2)} style={btnGold} className="btn-gold">Suivant <ArrowRight size={14} /></button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 — Infos ── */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '20px' }}>Informations du projet</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom du projet *</label>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Mercedes CLE 53 AMG" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Email de réception des leads</label>
                    <input type="email" value={form.leadEmail} onChange={(e) => set('leadEmail', e.target.value)} placeholder="contact@client.ca" style={inputStyle} className="dash-input" />
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '6px' }}>Les leads seront transmis à cette adresse</p>
                  </div>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Notes internes</label>
                    <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Spécificités, demandes du client..." style={{ ...inputStyle, resize: 'none' }} className="dash-input" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(1)} style={btnOutline} className="btn-outline"><ArrowLeft size={14} /> Retour</button>
                <button onClick={() => setCurrentStep(needsMatterport ? 3 : 4)} disabled={!form.name} style={{ ...btnGold, opacity: form.name ? 1 : 0.4, cursor: form.name ? 'pointer' : 'not-allowed' }} className="btn-gold">
                  Suivant <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 — Matterport ── */}
          {currentStep === 3 && needsMatterport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Lien Matterport</h2>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '20px' }}>Collez le lien ou l&apos;ID de la visite Matterport.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Lien ou ID Matterport *</label>
                    <input type="text" value={form.matterportUrl} onChange={(e) => set('matterportUrl', e.target.value)} placeholder="https://my.matterport.com/show/?m=XXXXXXXX ou WJzvgHF44zq" style={inputStyle} className="dash-input" />
                  </div>
                  {matterportId && (
                    <div>
                      <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Prévisualisation</label>
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--dash-gold-ring)', height: '200px' }}>
                        <iframe src={`https://my.matterport.com/show/?m=${matterportId}&play=1&qs=1`} style={{ width: '100%', height: '100%', border: 'none' }} title="Prévisualisation Matterport" />
                      </div>
                      <p style={{ color: 'var(--dash-success)', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={12} /> ID Matterport valide : {matterportId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(2)} style={btnOutline} className="btn-outline"><ArrowLeft size={14} /> Retour</button>
                <button onClick={() => setCurrentStep(4)} disabled={!matterportId} style={{ ...btnGold, opacity: matterportId ? 1 : 0.4, cursor: matterportId ? 'pointer' : 'not-allowed' }} className="btn-gold">
                  Suivant <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 — IA + Boutons ── */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {form.type !== 'matterport' && (
                <div style={cardStyle}>
                  <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '20px' }}>Configuration Luxedia IA</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom de l&apos;ambassadeur IA</label>
                      <input type="text" value={form.ambassadorName} onChange={(e) => set('ambassadorName', e.target.value)} placeholder="Ex: Luxedia" style={inputStyle} className="dash-input" />
                    </div>
                    <div>
                      <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Message d&apos;accueil</label>
                      <textarea rows={3} value={form.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} placeholder={`Bienvenue ! Je suis ${form.ambassadorName}, votre ambassadeur IA. Comment puis-je vous aider ?`} style={{ ...inputStyle, resize: 'none' }} className="dash-input" />
                    </div>
                  </div>
                </div>
              )}

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', margin: '0 0 4px' }}>Boutons d&apos;action ({form.boutons.length}/4)</h2>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>Ces boutons apparaîtront dans le chatbot</p>
                  </div>
                  {form.boutons.length < 4 && (
                    <button type="button" onClick={addBouton} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--dash-gold)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="add-btn">
                      <Plus size={12} /> Ajouter
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.boutons.map((bouton, i) => (
                    <div key={bouton.id} style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="dash-micro-label">Bouton {i + 1}</span>
                        {form.boutons.length > 1 && (
                          <button type="button" onClick={() => removeBouton(bouton.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dash-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }} className="del-btn">
                            <Trash2 size={11} /> Supprimer
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: '8px' }} className="btn-row">
                        <div>
                          <label className="dash-micro-label" style={{ marginBottom: '5px' }}>Nom *</label>
                          <input type="text" required value={bouton.label} onChange={(e) => updateBouton(bouton.id, 'label', e.target.value)} placeholder="Ex: Réserver un essai" style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input" />
                        </div>
                        <div>
                          <label className="dash-micro-label" style={{ marginBottom: '5px' }}>Type</label>
                          <select value={bouton.action} onChange={(e) => updateBouton(bouton.id, 'action', e.target.value)} style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input">
                            {TYPES_ACTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="dash-micro-label" style={{ marginBottom: '5px' }}>{bouton.action === 'call' ? 'Numéro' : 'URL'}</label>
                          <input type="text" value={bouton.url} onChange={(e) => updateBouton(bouton.id, 'url', e.target.value)} placeholder={bouton.action === 'call' ? 'tel:+14180000000' : 'https://'} style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload documents */}
              <div style={cardStyle}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Documents PDF</h2>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '16px' }}>Uploadez les fiches techniques, menus ou catalogues. (Optionnel)</p>
                <div style={{ border: '2px dashed var(--dash-border-input)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }} className="upload-zone">
                  <Upload size={24} style={{ color: 'var(--dash-gold-icon)', margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '4px' }}>Glissez vos PDFs ici ou <span style={{ color: 'var(--dash-gold)' }}>parcourez</span></p>
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>PDF uniquement · max 20 MB · disponible après création</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(needsMatterport ? 3 : 2)} style={btnOutline} className="btn-outline"><ArrowLeft size={14} /> Retour</button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || form.boutons.some((b) => !b.label)}
                  style={{ ...btnGold, opacity: isCreating || form.boutons.some((b) => !b.label) ? 0.5 : 1, cursor: isCreating ? 'not-allowed' : 'pointer' }}
                  className="btn-gold"
                >
                  {isCreating ? 'Création en cours...' : 'Créer le projet →'}
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 5 — Succès ── */}
          {currentStep === 5 && created && (
            <div style={{ ...cardStyle, border: '1px solid var(--dash-success-ring)', textAlign: 'center', padding: '48px 32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--dash-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={24} style={{ color: 'var(--dash-success)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: 'var(--dash-text)', marginBottom: '8px' }}>Projet créé avec succès !</h2>
              <p style={{ color: 'var(--dash-text-subtle)', fontSize: '14px', marginBottom: '32px' }}>{form.name} est maintenant disponible dans Supabase.</p>

              <div style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '14px', marginBottom: '12px', textAlign: 'left' }}>
                <p className="dash-micro-label" style={{ marginBottom: '6px' }}>Lien de l&apos;expérience</p>
                <code style={{ color: 'var(--dash-gold)', fontSize: '13px' }}>signature3dia.com/embed/{createdSlug}</code>
              </div>

              <div style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
                <p className="dash-micro-label" style={{ marginBottom: '6px' }}>Type</p>
                <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0 }}>{TYPES_PROJET.find((t) => t.value === form.type)?.label}</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link href={`/dashboard/clients/${slug}`} style={{ ...btnOutline, textDecoration: 'none' }} className="btn-outline">← Retour au client</Link>
                <Link href={`/embed/${createdSlug}`} target="_blank" style={{ ...btnGold, textDecoration: 'none' }} className="btn-gold">Voir l&apos;expérience →</Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .back-arrow:hover          { color: var(--dash-gold) !important; }
        .btn-gold:hover:not(:disabled) { background-color: #b8943d !important; }
        .btn-outline:hover         { border-color: var(--dash-gold-ring) !important; color: var(--dash-text) !important; }
        .del-btn:hover             { color: var(--dash-error) !important; background-color: var(--dash-error-bg) !important; }
        .add-btn:hover             { background-color: var(--dash-gold-muted) !important; }
        .upload-zone:hover         { border-color: var(--dash-gold-ring) !important; }
        .dash-input:focus          { border-color: var(--dash-gold) !important; }
        .type-btn:hover            { border-color: var(--dash-gold-ring) !important; }
        @media (max-width: 640px) { .btn-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
