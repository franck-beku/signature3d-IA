/**
 * ProjectForm — Formulaire création/édition de projet
 * Partagé par /dashboard/projets/nouveau et /dashboard/projets/[id]
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, ArrowLeft, Eye, EyeOff, Star } from 'lucide-react'
import Link from 'next/link'
import {
  projectsApi, clientsApi, sectorsApi,
  documentsApi,
  type ProjectDto, type ClientDto, type SectorDto, type DocumentDto,
} from '@/lib/api'
import ProjectDocumentsSection from './ProjectDocumentsSection'

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

const sectionTitle = {
  fontSize: '11px', color: 'var(--dash-gold)', textTransform: 'uppercase' as const,
  letterSpacing: '0.25em', margin: '0 0 16px 0', fontWeight: 500,
}

interface ButtonRow {
  label: string
  labelEn: string
  url: string
  action: string
  order: number
}

interface SuggestionRow {
  label: string
  labelEn: string
  answer: string
  answerEn: string
  order: number
}

interface DetailRow {
  label: string
  value: string
  displayOrder: number
  isVisible: boolean
}

interface Props {
  projectId?: string
}

export default function ProjectForm({ projectId }: Props) {
  const router = useRouter()
  const isEdit = !!projectId

  const [clients, setClients]     = useState<ClientDto[]>([])
  const [sectors, setSectors]     = useState<SectorDto[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [name, setName]                       = useState('')
  const [clientId, setClientId]               = useState('')
  const [sectorId, setSectorId]               = useState('')
  const [matterportId, setMatterportId]       = useState('')
  const [experienceType, setExperienceType]   = useState('Matterport')
  const [experienceUrl, setExperienceUrl]     = useState('')
  const [luxediaEnabled, setLuxediaEnabled]   = useState(true)
  const [ambassadorName, setAmbassadorName]   = useState('Luxedia')
  const [welcomeMessage, setWelcomeMessage]   = useState('')
  const [welcomeMessageEn, setWelcomeMessageEn] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [shortDescriptionEn, setShortDescriptionEn] = useState('')
  const [coverImage, setCoverImage]           = useState('')
  const [status, setStatus]                   = useState('Active')
  const [isPublished, setIsPublished]         = useState(false)
  const [isFeatured, setIsFeatured]           = useState(false)
  const [displayOrder, setDisplayOrder]       = useState(0)
  const [buttons, setButtons]                 = useState<ButtonRow[]>([])
  const [suggestions, setSuggestions]         = useState<SuggestionRow[]>([])
  const [details, setDetails]                 = useState<DetailRow[]>([])

  const [documents, setDocuments]               = useState<DocumentDto[]>([])
  const [docsLoading, setDocsLoading]           = useState(false)
  const [uploadingDoc, setUploadingDoc]         = useState(false)
  const [uploadIsInternal, setUploadIsInternal] = useState(false)
  const [ocrPendingIds, setOcrPendingIds]       = useState<Set<string>>(new Set())
  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])

  // Valeurs de données Luxedia — ne pas modifier (couleurs choisies par le client)
  const [luxediaPrimaryColor, setLuxediaPrimaryColor]         = useState('#d4af37')
  const [luxediaWidgetBgColor, setLuxediaWidgetBgColor]       = useState('#111111')
  const [luxediaBotMessageColor, setLuxediaBotMessageColor]   = useState('#1a1a1a')
  const [luxediaUserMessageColor, setLuxediaUserMessageColor] = useState('#d4af37')
  const [luxediaAvatarUrl, setLuxediaAvatarUrl]               = useState('')
  const [luxediaClientLogoUrl, setLuxediaClientLogoUrl]       = useState('')
  const [luxediaLanguage, setLuxediaLanguage]                 = useState('')

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [clientsRes, sectorsRes] = await Promise.all([
          clientsApi.getAll(1, 100),
          sectorsApi.getAll(),
        ])
        setClients(clientsRes.items as ClientDto[])
        setSectors(sectorsRes as SectorDto[])

        if (isEdit && projectId) {
          const all = await projectsApi.getAll()
          const p = (all as ProjectDto[]).find((x) => x.id === projectId)
          if (p) {
            setName(p.name)
            setClientId(p.clientId)
            setSectorId(p.sectorId ?? '')
            setMatterportId(p.matterportId ?? '')
            setExperienceType(p.experienceType ?? 'Matterport')
            setExperienceUrl(p.experienceUrl ?? '')
            setLuxediaEnabled(p.luxediaEnabled ?? true)
            setAmbassadorName(p.ambassadorName)
            setWelcomeMessage(p.welcomeMessage ?? '')
            setWelcomeMessageEn(p.welcomeMessageEn ?? '')
            setShortDescription(p.shortDescription ?? '')
            setShortDescriptionEn(p.shortDescriptionEn ?? '')
            setCoverImage(p.coverImage ?? '')
            setStatus(p.status)
            setIsPublished(p.isPublished)
            setIsFeatured(p.isFeatured)
            setDisplayOrder(p.displayOrder)
            setButtons(p.buttons.map((b) => ({ label: b.label, labelEn: b.labelEn ?? '', url: b.url ?? '', action: b.action, order: b.order })))
            setSuggestions(p.suggestions.map((s) => ({ label: s.label, labelEn: s.labelEn ?? '', answer: s.answer ?? '', answerEn: s.answerEn ?? '', order: s.order })))
            setDetails(p.details.map((d) => ({ label: d.label, value: d.value, displayOrder: d.displayOrder, isVisible: d.isVisible })))
            setLuxediaPrimaryColor(p.luxediaPrimaryColor ?? '#d4af37')
            setLuxediaWidgetBgColor(p.luxediaWidgetBgColor ?? '#111111')
            setLuxediaBotMessageColor(p.luxediaBotMessageColor ?? '#1a1a1a')
            setLuxediaUserMessageColor(p.luxediaUserMessageColor ?? '#d4af37')
            setLuxediaAvatarUrl(p.luxediaAvatarUrl ?? '')
            setLuxediaClientLogoUrl(p.luxediaClientLogoUrl ?? '')
            setLuxediaLanguage(p.luxediaLanguage ?? '')
          } else {
            setError('Projet introuvable.')
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [isEdit, projectId])

  useEffect(() => {
    if (!isEdit || !projectId) return
    setDocsLoading(true)
    documentsApi.getByProject(projectId)
      .then((docs) => setDocuments(docs as DocumentDto[]))
      .catch(() => {})
      .finally(() => setDocsLoading(false))
  }, [isEdit, projectId])

  const addButton = () => setButtons((prev) => [...prev, { label: '', labelEn: '', url: '', action: 'link', order: prev.length }])
  const removeButton = (i: number) => setButtons((prev) => prev.filter((_, idx) => idx !== i))
  const updateButton = (i: number, field: keyof ButtonRow, value: string | number) =>
    setButtons((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b))

  const addSuggestion = () => setSuggestions((prev) => [...prev, { label: '', labelEn: '', answer: '', answerEn: '', order: prev.length }])
  const removeSuggestion = (i: number) => setSuggestions((prev) => prev.filter((_, idx) => idx !== i))
  const updateSuggestion = (i: number, field: keyof SuggestionRow, value: string | number) =>
    setSuggestions((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const addDetail = () => setDetails((prev) => [...prev, { label: '', value: '', displayOrder: prev.length, isVisible: true }])
  const removeDetail = (i: number) => setDetails((prev) => prev.filter((_, idx) => idx !== i))
  const updateDetail = (i: number, field: keyof DetailRow, value: string | number | boolean) =>
    setDetails((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))

  const handleUploadDocument = async (file: File) => {
    if (!projectId) return
    setUploadingDoc(true)
    try {
      const doc = await documentsApi.upload(projectId, file, uploadIsInternal)
      setDocuments((prev) => [doc as DocumentDto, ...prev])
      setUploadIsInternal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleToggleCategory = async (doc: DocumentDto) => {
    try {
      await documentsApi.setCategory(doc.id, !doc.isInternal)
      setDocuments((prev) => prev.map((d) =>
        d.id === doc.id ? { ...d, isInternal: !d.isInternal, isIndexed: false } : d
      ))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentsApi.delete(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  /** Enfile l'OCR puis poll toutes les 3s (max 20x = 60s) jusqu'à ce que l'état de la page change. */
  const pollOcrResult = (documentId: string, attempt = 0) => {
    if (attempt >= 20) {
      if (isMountedRef.current) setOcrPendingIds((prev) => { const next = new Set(prev); next.delete(documentId); return next })
      return
    }
    setTimeout(async () => {
      if (!isMountedRef.current || !projectId) return
      try {
        const docs = await documentsApi.getByProject(projectId) as DocumentDto[]
        if (!isMountedRef.current) return
        setDocuments(docs)
        const updated = docs.find((d) => d.id === documentId)
        const stillProcessing = !!updated && updated.lowTextPageNumbers?.length > 0 && updated.ocrFailedPageNumbers?.length === 0
        if (stillProcessing) {
          pollOcrResult(documentId, attempt + 1)
        } else {
          setOcrPendingIds((prev) => { const next = new Set(prev); next.delete(documentId); return next })
        }
      } catch {
        pollOcrResult(documentId, attempt + 1)
      }
    }, 3000)
  }

  const handleRequestOcr = async (documentId: string) => {
    try {
      await documentsApi.requestOcrReindex(documentId)
      setOcrPendingIds((prev) => new Set(prev).add(documentId))
      pollOcrResult(documentId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Le nom du projet est obligatoire.'); return }
    if (!clientId)    { setError('Le client est obligatoire.'); return }
    setSaving(true)
    setError(null)
    try {
      const cleanButtons = buttons
        .filter((b) => b.label.trim())
        .map((b, i) => ({ label: b.label, labelEn: b.labelEn || undefined, url: b.url || undefined, action: b.action, order: i }))

      const cleanSuggestions = suggestions
        .filter((s) => s.label.trim())
        .map((s, i) => ({
          label: s.label, labelEn: s.labelEn || undefined,
          answer: s.answer || undefined, answerEn: s.answerEn || undefined,
          order: i,
        }))

      const cleanDetails = details
        .filter((d) => d.label.trim() && d.value.trim())
        .map((d, i) => ({ label: d.label, value: d.value, displayOrder: i, isVisible: d.isVisible }))

      // En mode IA seule, Luxedia est le coeur de l'expérience — toujours actif,
      // indépendamment de l'état du toggle (désactivé/grisé dans ce cas).
      const effectiveLuxediaEnabled = experienceType === 'IAOnly' ? true : luxediaEnabled

      if (isEdit && projectId) {
        await projectsApi.update(projectId, {
          name, matterportId: matterportId || undefined, ambassadorName,
          experienceType, experienceUrl: experienceUrl || undefined,
          welcomeMessage: welcomeMessage || undefined, welcomeMessageEn: welcomeMessageEn || undefined, status,
          shortDescription: shortDescription || undefined, shortDescriptionEn: shortDescriptionEn || undefined, coverImage: coverImage || undefined,
          isPublished, isFeatured, displayOrder,
          sectorId: sectorId || undefined,
          buttons: cleanButtons,
          suggestions: cleanSuggestions,
          details: cleanDetails,
          luxediaPrimaryColor: luxediaPrimaryColor || undefined,
          luxediaWidgetBgColor: luxediaWidgetBgColor || undefined,
          luxediaBotMessageColor: luxediaBotMessageColor || undefined,
          luxediaUserMessageColor: luxediaUserMessageColor || undefined,
          luxediaAvatarUrl: luxediaAvatarUrl || undefined,
          luxediaClientLogoUrl: luxediaClientLogoUrl || undefined,
          luxediaLanguage: luxediaLanguage || undefined,
          luxediaEnabled: effectiveLuxediaEnabled,
        })
      } else {
        await projectsApi.create({
          name, matterportId: matterportId || undefined, ambassadorName,
          experienceType, experienceUrl: experienceUrl || undefined,
          luxediaEnabled: effectiveLuxediaEnabled,
          welcomeMessage: welcomeMessage || undefined, welcomeMessageEn: welcomeMessageEn || undefined, clientId,
          shortDescription: shortDescription || undefined, shortDescriptionEn: shortDescriptionEn || undefined, coverImage: coverImage || undefined,
          isPublished, isFeatured, displayOrder,
          sectorId: sectorId || undefined,
          buttons: cleanButtons,
          suggestions: cleanSuggestions,
          details: cleanDetails,
        })
      }
      router.push('/dashboard/projets')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-bg)', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
  }

  return (
    <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
        <Link href="/dashboard/projets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="back-btn">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
          </h1>
          <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">Expérience immersive</p>
        </div>
      </div>

      <div style={{ padding: '28px 40px', maxWidth: '760px' }}>
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '24px' }}>{error}</div>
        )}

        {/* SECTION 1 — Informations */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Informations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Nom du projet *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mercedes CLE 53 AMG" style={inputStyle} className="dash-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Client *</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputStyle} className="dash-input">
                  <option value="">Choisir un client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Secteur</label>
                <select value={sectorId} onChange={(e) => setSectorId(e.target.value)} style={inputStyle} className="dash-input">
                  <option value="">Aucun</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Ordre d'affichage</label>
                <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} style={inputStyle} className="dash-input" />
              </div>
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Description courte (carte vitrine)</label>
              <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Cabriolet sport haute performance avec expérience immersive." style={inputStyle} className="dash-input" />
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Description courte (EN)</label>
              <input type="text" value={shortDescriptionEn} onChange={(e) => setShortDescriptionEn(e.target.value)} placeholder="High-performance sport convertible with an immersive experience." style={inputStyle} className="dash-input" />
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Image de couverture (URL)</label>
              <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." style={inputStyle} className="dash-input" />
            </div>
          </div>
        </div>

        {/* SECTION 2 — Expérience immersive */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Expérience immersive</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Type d'expérience</label>
              <select value={experienceType} onChange={(e) => setExperienceType(e.target.value)} style={inputStyle} className="dash-input">
                <option value="Matterport">Matterport (jumeau numérique 3D)</option>
                <option value="Tour360">360° (Glo3D, Kuula...)</option>
                <option value="IAOnly">IA seule (chat plein écran)</option>
              </select>
            </div>

            {experienceType === 'Matterport' && (
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Matterport ID</label>
                <input type="text" value={matterportId} onChange={(e) => setMatterportId(e.target.value)} placeholder="WJzvgHF44zq" style={inputStyle} className="dash-input" />
              </div>
            )}

            {experienceType === 'Tour360' && (
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>URL de l'expérience 360°</label>
                <input type="text" value={experienceUrl} onChange={(e) => setExperienceUrl(e.target.value)} placeholder="https://glo3d.net/xxxxx" style={inputStyle} className="dash-input" />
              </div>
            )}

            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Assistant Luxedia</label>
              <button
                type="button"
                onClick={() => setLuxediaEnabled((v) => !v)}
                disabled={experienceType === 'IAOnly'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
                  border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-input)',
                  color: (luxediaEnabled || experienceType === 'IAOnly') ? 'var(--dash-success)' : 'var(--dash-text-subtle)',
                  cursor: experienceType === 'IAOnly' ? 'not-allowed' : 'pointer',
                  opacity: experienceType === 'IAOnly' ? 0.6 : 1,
                  fontSize: '13px',
                }}
              >
                {(luxediaEnabled || experienceType === 'IAOnly') ? <Eye size={14} /> : <EyeOff size={14} />}
                {experienceType === 'IAOnly'
                  ? 'Toujours actif en mode IA seule'
                  : (luxediaEnabled ? 'Assistant Luxedia activé' : 'Assistant Luxedia désactivé')}
              </button>
              {experienceType !== 'IAOnly' && (
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: '8px 0 0' }}>
                  Désactivé : le lien/QR final mène uniquement à la visite, sans widget de chat à côté.
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Nom de l'ambassadeur IA</label>
                <input type="text" value={ambassadorName} onChange={(e) => setAmbassadorName(e.target.value)} placeholder="Luxedia" style={inputStyle} className="dash-input" />
              </div>
              {isEdit && (
                <div>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Statut</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle} className="dash-input">
                    <option value="Active">Actif</option>
                    <option value="Draft">Brouillon</option>
                    <option value="Archived">Archivé</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Message d'accueil de Luxedia</label>
              <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={2} placeholder="Bienvenue ! Je suis Luxedia, votre assistant. Comment puis-je vous aider ?" style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Message d'accueil de Luxedia (EN)</label>
              <textarea value={welcomeMessageEn} onChange={(e) => setWelcomeMessageEn(e.target.value)} rows={2} placeholder="Welcome! I'm Luxedia, your assistant. How can I help you?" style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
            </div>
          </div>
        </div>

        {/* SECTION 3 — Personnalisation Luxedia */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Personnalisation Luxedia</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {([
                ['Couleur principale', luxediaPrimaryColor, setLuxediaPrimaryColor],
                ['Fond du widget', luxediaWidgetBgColor, setLuxediaWidgetBgColor],
                ['Bulle Luxedia', luxediaBotMessageColor, setLuxediaBotMessageColor],
                ['Bulle utilisateur', luxediaUserMessageColor, setLuxediaUserMessageColor],
              ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]).map(([label, val, set]) => (
                <div key={label}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color" value={val}
                      onChange={(e) => set(e.target.value)}
                      style={{ width: '38px', height: '36px', border: '1px solid var(--dash-border-input)', borderRadius: '6px', cursor: 'pointer', padding: '2px 3px', backgroundColor: 'var(--dash-input)', flexShrink: 0 }}
                    />
                    <input
                      type="text" value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder="#d4af37"
                      style={inputStyle} className="dash-input"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Avatar Luxedia (URL)</label>
                <input type="text" value={luxediaAvatarUrl} onChange={(e) => setLuxediaAvatarUrl(e.target.value)} placeholder="https://... ou /luxedia-avatar.png" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Logo client (URL)</label>
                <input type="text" value={luxediaClientLogoUrl} onChange={(e) => setLuxediaClientLogoUrl(e.target.value)} placeholder="https://... ou /logo-dark.png" style={inputStyle} className="dash-input" />
              </div>
            </div>

            <div style={{ maxWidth: '200px' }}>
              <label className="dash-label" style={{ display: 'block', marginBottom: '6px' }}>Langue</label>
              <select value={luxediaLanguage} onChange={(e) => setLuxediaLanguage(e.target.value)} style={inputStyle} className="dash-input">
                <option value="">Automatique (détecte la langue du visiteur)</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

          </div>
        </div>

        {/* SECTION 4 — Boutons d'action */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Boutons d'action</p>
            <button onClick={addButton} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dash-gold)', background: 'none', border: '1px solid var(--dash-gold-ring)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          {buttons.length === 0 ? (
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucun bouton. Ajoutez des actions (Réserver, Appeler, Itinéraire...).</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {buttons.map((b, i) => (
                <div key={i} style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input type="text" value={b.label} onChange={(e) => updateButton(i, 'label', e.target.value)} placeholder="Libellé (FR) — Réserver un essai" style={inputStyle} className="dash-input" />
                    <input type="text" value={b.labelEn} onChange={(e) => updateButton(i, 'labelEn', e.target.value)} placeholder="Libellé (EN) — Book a test drive" style={inputStyle} className="dash-input" />
                    <button onClick={() => removeButton(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Retirer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                    <input type="text" value={b.url} onChange={(e) => updateButton(i, 'url', e.target.value)} placeholder="https://... ou tel:+1..." style={inputStyle} className="dash-input" />
                    <select value={b.action} onChange={(e) => updateButton(i, 'action', e.target.value)} style={inputStyle} className="dash-input">
                      <option value="link">Lien</option>
                      <option value="form">Formulaire</option>
                      <option value="call">Appel</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4bis — Suggestions rapides */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Suggestions rapides</p>
            <button onClick={addSuggestion} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dash-gold)', background: 'none', border: '1px solid var(--dash-gold-ring)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: '0 0 16px 0' }}>
            Boutons de suggestion proposés par Luxedia dans le chat (ex: Quel est le prix ?, Disponibilité ?).
          </p>
          {suggestions.length === 0 ? (
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucune suggestion. Les suggestions par défaut du widget seront utilisées.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {suggestions.map((s, i) => (
                <div key={i} style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <input type="text" value={s.label} onChange={(e) => updateSuggestion(i, 'label', e.target.value)} placeholder="Libellé (FR)" style={inputStyle} className="dash-input" />
                    <input type="text" value={s.labelEn} onChange={(e) => updateSuggestion(i, 'labelEn', e.target.value)} placeholder="Libellé (EN)" style={inputStyle} className="dash-input" />
                    <button onClick={() => removeSuggestion(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Retirer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <textarea value={s.answer} onChange={(e) => updateSuggestion(i, 'answer', e.target.value)} rows={2} placeholder="Réponse directe (FR, optionnel)" style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
                    <textarea value={s.answerEn} onChange={(e) => updateSuggestion(i, 'answerEn', e.target.value)} rows={2} placeholder="Réponse directe (EN, optionnel)" style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
                  </div>
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: '6px 0 0 0' }}>
                    Si rempli, Luxedia affiche cette réponse immédiatement au lieu de chercher dans les documents.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5 — Caractéristiques */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Caractéristiques</p>
            <button onClick={addDetail} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dash-gold)', background: 'none', border: '1px solid var(--dash-gold-ring)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: '0 0 16px 0' }}>
            Infos affichées sur la carte (ex: Prix → 89 900 $, Kilométrage → 12 000 km, Superficie → 2 400 pi²). Masquez celles que vous ne voulez pas montrer.
          </p>
          {details.length === 0 ? (
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucune caractéristique.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {details.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto auto', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={d.label} onChange={(e) => updateDetail(i, 'label', e.target.value)} placeholder="Prix" style={inputStyle} className="dash-input" />
                  <input type="text" value={d.value} onChange={(e) => updateDetail(i, 'value', e.target.value)} placeholder="89 900 $" style={inputStyle} className="dash-input" />
                  <button onClick={() => updateDetail(i, 'isVisible', !d.isVisible)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-input)', color: d.isVisible ? 'var(--dash-success)' : 'var(--dash-text-subtle)', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }} title={d.isVisible ? 'Visible' : 'Masqué'}>
                    {d.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {d.isVisible ? 'Visible' : 'Masqué'}
                  </button>
                  <button onClick={() => removeDetail(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '38px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Retirer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION — Documents (édition uniquement) */}
        {isEdit && (
          <ProjectDocumentsSection
            documents={documents}
            docsLoading={docsLoading}
            uploadingDoc={uploadingDoc}
            uploadIsInternal={uploadIsInternal}
            onUploadIsInternalChange={setUploadIsInternal}
            onUpload={handleUploadDocument}
            onToggleCategory={handleToggleCategory}
            onDelete={handleDeleteDocument}
            onRequestOcr={handleRequestOcr}
            ocrPendingIds={ocrPendingIds}
          />
        )}

        {/* SECTION — Publication */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <p style={sectionTitle}>Publication</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsPublished(!isPublished)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-input)', color: isPublished ? 'var(--dash-success)' : 'var(--dash-text-subtle)', cursor: 'pointer', fontSize: '13px' }}>
              {isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
              {isPublished ? 'Publié sur le site' : 'Brouillon (non publié)'}
            </button>
            <button onClick={() => setIsFeatured(!isFeatured)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-input)', color: isFeatured ? 'var(--dash-gold)' : 'var(--dash-text-subtle)', cursor: 'pointer', fontSize: '13px' }}>
              <Star size={14} style={isFeatured ? { fill: 'var(--dash-gold)' } : undefined} />
              {isFeatured ? 'En vedette' : 'Pas en vedette'}
            </button>
          </div>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: '12px 0 0 0' }}>
            Un projet doit être « Publié » pour apparaître dans les Réalisations du site. « En vedette » le met en avant sur l'accueil.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '11px 24px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
            <Check size={14} /> {saving ? 'Sauvegarde...' : (isEdit ? 'Enregistrer' : 'Créer le projet')}
          </button>
          <Link href="/dashboard/projets" style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '11px 24px', cursor: 'pointer', textDecoration: 'none' }}>Annuler</Link>
        </div>
      </div>

      <style>{`
        .back-btn:hover   { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .add-btn:hover    { background-color: var(--dash-gold-muted) !important; }
        .del-btn:hover    { background-color: var(--dash-error-bg) !important; }
        .save-btn:hover   { background-color: #b8943d !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
      `}</style>
    </main>
  )
}
