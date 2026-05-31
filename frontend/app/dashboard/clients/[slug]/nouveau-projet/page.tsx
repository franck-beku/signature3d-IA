/**
 * Nouveau Projet — Dashboard
 * Version: 3.0 — Connecté au backend PostgreSQL
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
const GOLD = '#d4af37'

const inputStyle = {
  width: '100%', backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  padding: '12px 16px', fontSize: '13px', color: 'white' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.3s ease',
}
const labelStyle = {
  display: 'block', fontSize: '11px',
  textTransform: 'uppercase' as const, letterSpacing: '0.25em',
  color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
}
const cardStyle = {
  backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '14px', padding: '24px',
}
const btnGold = {
  display: 'flex', alignItems: 'center', gap: '8px',
  backgroundColor: GOLD, color: '#000',
  fontSize: '13px', fontWeight: 600, padding: '11px 24px',
  borderRadius: '10px', border: 'none', cursor: 'pointer',
  transition: 'all 0.2s ease',
}
const btnOutline = {
  display: 'flex', alignItems: 'center', gap: '8px',
  border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
  fontSize: '13px', padding: '11px 24px', borderRadius: '10px',
  background: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
}

function getMatterportId(url: string): string | null {
  const m = url.match(/[?&]m=([^&]+)/)
  if (m) return m[1]
  // Support direct ID input (ex: WJzvgHF44zq)
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

  /* Charger le client pour récupérer son ID */
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

  /* Créer le projet via l'API */
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
      })

      setCreatedSlug((result as any).slug)
      setCreated(true)
      setCurrentStep(5)
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue.')
    } finally {
      setIsCreating(false)
    }
  }

  const needsMatterport = form.type !== 'ia_seule'
  const matterportId    = getMatterportId(form.matterportUrl)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href={`/dashboard/clients/${slug}`} style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Nouveau projet</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
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
                    backgroundColor: currentStep > step.id ? '#4ade80' : currentStep === step.id ? GOLD : '#1a1a1a',
                    color: currentStep >= step.id ? '#000' : 'rgba(255,255,255,0.3)',
                    border: currentStep >= step.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {currentStep > step.id ? <Check size={14} /> : step.id}
                  </div>
                  <p style={{ fontSize: '10px', marginTop: '6px', whiteSpace: 'nowrap', color: currentStep === step.id ? GOLD : 'rgba(255,255,255,0.2)' }}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div style={{ flex: 1, height: '1px', margin: '0 8px', marginBottom: '16px', backgroundColor: currentStep > step.id ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Erreur globale */}
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* ── ÉTAPE 1 — Type ── */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Type de projet</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '24px' }}>Choisissez l&apos;expérience à livrer au client.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {TYPES_PROJET.map((t) => (
                    <button key={t.value} type="button" onClick={() => set('type', t.value)}
                      style={{ padding: '16px 20px', borderRadius: '12px', textAlign: 'left', border: `1px solid ${form.type === t.value ? GOLD : 'rgba(255,255,255,0.08)'}`, backgroundColor: form.type === t.value ? 'rgba(212,175,55,0.08)' : '#1a1a1a', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px' }}
                      className="type-btn"
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${form.type === t.value ? GOLD : 'rgba(255,255,255,0.2)'}`, backgroundColor: form.type === t.value ? GOLD : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {form.type === t.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }} />}
                      </div>
                      <div>
                        <p style={{ color: form.type === t.value ? GOLD : 'white', fontSize: '14px', fontWeight: 600, margin: '0 0 3px' }}>{t.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{t.desc}</p>
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
                <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '20px' }}>Informations du projet</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nom du projet *</label>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Mercedes CLE 53 AMG" style={inputStyle} className="dash-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email de réception des leads</label>
                    <input type="email" value={form.leadEmail} onChange={(e) => set('leadEmail', e.target.value)} placeholder="contact@client.ca" style={inputStyle} className="dash-input" />
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '6px' }}>Les leads seront transmis à cette adresse</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Notes internes</label>
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
                <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Lien Matterport</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '20px' }}>Collez le lien ou l&apos;ID de la visite Matterport.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Lien ou ID Matterport *</label>
                    <input type="text" value={form.matterportUrl} onChange={(e) => set('matterportUrl', e.target.value)} placeholder="https://my.matterport.com/show/?m=XXXXXXXX ou WJzvgHF44zq" style={inputStyle} className="dash-input" />
                  </div>
                  {matterportId && (
                    <div>
                      <label style={labelStyle}>Prévisualisation</label>
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', height: '200px' }}>
                        <iframe src={`https://my.matterport.com/show/?m=${matterportId}&play=1&qs=1`} style={{ width: '100%', height: '100%', border: 'none' }} title="Prévisualisation Matterport" />
                      </div>
                      <p style={{ color: '#4ade80', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '20px' }}>Configuration Luxedia IA</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nom de l&apos;ambassadeur IA</label>
                      <input type="text" value={form.ambassadorName} onChange={(e) => set('ambassadorName', e.target.value)} placeholder="Ex: Luxedia" style={inputStyle} className="dash-input" />
                    </div>
                    <div>
                      <label style={labelStyle}>Message d&apos;accueil</label>
                      <textarea rows={3} value={form.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} placeholder={`Bienvenue ! Je suis ${form.ambassadorName}, votre ambassadeur IA. Comment puis-je vous aider ?`} style={{ ...inputStyle, resize: 'none' }} className="dash-input" />
                    </div>
                  </div>
                </div>
              )}

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', margin: '0 0 4px' }}>Boutons d&apos;action ({form.boutons.length}/4)</h2>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>Ces boutons apparaîtront dans le chatbot</p>
                  </div>
                  {form.boutons.length < 4 && (
                    <button type="button" onClick={addBouton} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 12px', borderRadius: '6px', border: `1px solid ${GOLD}`, color: GOLD, background: 'none', cursor: 'pointer' }} className="add-btn">
                      <Plus size={12} /> Ajouter
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.boutons.map((bouton, i) => (
                    <div key={bouton.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Bouton {i + 1}</span>
                        {form.boutons.length > 1 && (
                          <button type="button" onClick={() => removeBouton(bouton.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }} className="del-btn">
                            <Trash2 size={11} /> Supprimer
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: '8px' }} className="btn-row">
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px', marginBottom: '5px' }}>Nom *</label>
                          <input type="text" required value={bouton.label} onChange={(e) => updateBouton(bouton.id, 'label', e.target.value)} placeholder="Ex: Réserver un essai" style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px', marginBottom: '5px' }}>Type</label>
                          <select value={bouton.action} onChange={(e) => updateBouton(bouton.id, 'action', e.target.value)} style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input">
                            {TYPES_ACTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px', marginBottom: '5px' }}>{bouton.action === 'call' ? 'Numéro' : 'URL'}</label>
                          <input type="text" value={bouton.url} onChange={(e) => updateBouton(bouton.id, 'url', e.target.value)} placeholder={bouton.action === 'call' ? 'tel:+14180000000' : 'https://'} style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }} className="dash-input" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload documents */}
              <div style={cardStyle}>
                <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>Documents PDF</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '16px' }}>Uploadez les fiches techniques, menus ou catalogues. (Optionnel)</p>
                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }} className="upload-zone">
                  <Upload size={24} style={{ color: 'rgba(212,175,55,0.4)', margin: '0 auto 10px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '4px' }}>Glissez vos PDFs ici ou <span style={{ color: GOLD }}>parcourez</span></p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>PDF uniquement · max 20 MB · disponible après création</p>
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
            <div style={{ ...cardStyle, border: '1px solid rgba(74,222,128,0.2)', textAlign: 'center', padding: '48px 32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={24} style={{ color: '#4ade80' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '8px' }}>Projet créé avec succès !</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>{form.name} est maintenant disponible dans Supabase.</p>

              <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px', marginBottom: '12px', textAlign: 'left' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '6px' }}>Lien de l&apos;expérience</p>
                <code style={{ color: GOLD, fontSize: '13px' }}>signature3dia.com/embed/{createdSlug}</code>
              </div>

              <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '6px' }}>Type</p>
                <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{TYPES_PROJET.find((t) => t.value === form.type)?.label}</p>
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
        .back-arrow:hover { color: ${GOLD} !important; }
        .btn-gold:hover:not(:disabled) { background-color: #c9a84c !important; }
        .btn-outline:hover { border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.6) !important; }
        .del-btn:hover { color: #f87171 !important; background-color: rgba(248,113,113,0.08) !important; }
        .add-btn:hover { background-color: rgba(212,175,55,0.1) !important; }
        .upload-zone:hover { border-color: rgba(212,175,55,0.3) !important; }
        .dash-input:focus { border-color: ${GOLD} !important; }
        .type-btn:hover { border-color: rgba(212,175,55,0.4) !important; }
        @media (max-width: 640px) { .btn-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
