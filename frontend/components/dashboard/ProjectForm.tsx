/**
 * ProjectForm — Formulaire création/édition de projet
 * Partagé par /dashboard/projets/nouveau et /dashboard/projets/[id]
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, ArrowLeft, Eye, EyeOff, Star, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import {
  projectsApi, clientsApi, sectorsApi, offeringsApi,
  documentsApi,
  type ProjectDto, type ClientDto, type SectorDto, type OfferingDto, type DocumentDto,
} from '@/lib/api'

const GOLD = '#d4af37'

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

const sectionTitle = {
  fontSize: '11px', color: GOLD, textTransform: 'uppercase' as const,
  letterSpacing: '0.25em', margin: '0 0 16px 0', fontWeight: 500,
}

interface ButtonRow {
  label: string
  url: string
  action: string
  order: number
}

interface DetailRow {
  label: string
  value: string
  displayOrder: number
  isVisible: boolean
}

interface Props {
  projectId?: string   // si présent → mode édition
}

export default function ProjectForm({ projectId }: Props) {
  const router = useRouter()
  const isEdit = !!projectId

  const [clients, setClients]     = useState<ClientDto[]>([])
  const [sectors, setSectors]     = useState<SectorDto[]>([])
  const [offerings, setOfferings] = useState<OfferingDto[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Champs du formulaire
  const [name, setName]                       = useState('')
  const [clientId, setClientId]               = useState('')
  const [sectorId, setSectorId]               = useState('')
  const [offeringId, setOfferingId]           = useState('')
  const [matterportId, setMatterportId]       = useState('')
  const [experienceType, setExperienceType]   = useState('Matterport')
  const [experienceUrl, setExperienceUrl]     = useState('')
  const [ambassadorName, setAmbassadorName]   = useState('Luxedia')
  const [welcomeMessage, setWelcomeMessage]   = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [coverImage, setCoverImage]           = useState('')
  const [status, setStatus]                   = useState('Active')
  const [isPublished, setIsPublished]         = useState(false)
  const [isFeatured, setIsFeatured]           = useState(false)
  const [displayOrder, setDisplayOrder]       = useState(0)
  const [buttons, setButtons]                 = useState<ButtonRow[]>([])
  const [details, setDetails]                 = useState<DetailRow[]>([])

  // Documents (mode édition uniquement)
  const [documents, setDocuments]               = useState<DocumentDto[]>([])
  const [docsLoading, setDocsLoading]           = useState(false)
  const [uploadingDoc, setUploadingDoc]         = useState(false)
  const [uploadIsInternal, setUploadIsInternal] = useState(false)

  // Champs Luxedia
  const [luxediaPrimaryColor, setLuxediaPrimaryColor]         = useState('#d4af37')
  const [luxediaWidgetBgColor, setLuxediaWidgetBgColor]       = useState('#111111')
  const [luxediaBotMessageColor, setLuxediaBotMessageColor]   = useState('#1a1a1a')
  const [luxediaUserMessageColor, setLuxediaUserMessageColor] = useState('#d4af37')
  const [luxediaAvatarUrl, setLuxediaAvatarUrl]               = useState('')
  const [luxediaClientLogoUrl, setLuxediaClientLogoUrl]       = useState('')
  const [luxediaLanguage, setLuxediaLanguage]                 = useState('fr')

  // Chargement initial : listes déroulantes + projet (si édition)
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [clientsRes, sectorsRes, offeringsRes] = await Promise.all([
          clientsApi.getAll(1, 100),
          sectorsApi.getAll(),
          offeringsApi.getAll(),
        ])
        setClients(clientsRes.items as ClientDto[])
        setSectors(sectorsRes as SectorDto[])
        setOfferings(offeringsRes as OfferingDto[])

        if (isEdit && projectId) {
          // Charger le projet à éditer : on récupère tous les projets et on filtre
          const all = await projectsApi.getAll()
          const p = (all as ProjectDto[]).find((x) => x.id === projectId)
          if (p) {
            setName(p.name)
            setClientId(p.clientId)
            setSectorId(p.sectorId ?? '')
            setOfferingId(p.offeringId ?? '')
            setMatterportId(p.matterportId ?? '')
            setExperienceType(p.experienceType ?? 'Matterport')
            setExperienceUrl(p.experienceUrl ?? '')
            setAmbassadorName(p.ambassadorName)
            setWelcomeMessage(p.welcomeMessage ?? '')
            setShortDescription(p.shortDescription ?? '')
            setCoverImage(p.coverImage ?? '')
            setStatus(p.status)
            setIsPublished(p.isPublished)
            setIsFeatured(p.isFeatured)
            setDisplayOrder(p.displayOrder)
            setButtons(p.buttons.map((b) => ({ label: b.label, url: b.url ?? '', action: b.action, order: b.order })))
            setDetails(p.details.map((d) => ({ label: d.label, value: d.value, displayOrder: d.displayOrder, isVisible: d.isVisible })))
            setLuxediaPrimaryColor(p.luxediaPrimaryColor ?? '#d4af37')
            setLuxediaWidgetBgColor(p.luxediaWidgetBgColor ?? '#111111')
            setLuxediaBotMessageColor(p.luxediaBotMessageColor ?? '#1a1a1a')
            setLuxediaUserMessageColor(p.luxediaUserMessageColor ?? '#d4af37')
            setLuxediaAvatarUrl(p.luxediaAvatarUrl ?? '')
            setLuxediaClientLogoUrl(p.luxediaClientLogoUrl ?? '')
            setLuxediaLanguage(p.luxediaLanguage ?? 'fr')
          } else {
            setError('Projet introuvable.')
          }
        }
      } catch (err: any) {
        setError(err.message)
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

  const addButton = () => setButtons((prev) => [...prev, { label: '', url: '', action: 'link', order: prev.length }])
  const removeButton = (i: number) => setButtons((prev) => prev.filter((_, idx) => idx !== i))
  const updateButton = (i: number, field: keyof ButtonRow, value: string | number) =>
    setButtons((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b))

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
    } catch (err: any) {
      setError(err.message)
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
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentsApi.delete(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (err: any) {
      setError(err.message)
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
        .map((b, i) => ({ label: b.label, url: b.url || undefined, action: b.action, order: i }))

      const cleanDetails = details
        .filter((d) => d.label.trim() && d.value.trim())
        .map((d, i) => ({ label: d.label, value: d.value, displayOrder: i, isVisible: d.isVisible }))

      if (isEdit && projectId) {
        await projectsApi.update(projectId, {
          name, matterportId: matterportId || undefined, ambassadorName,
          experienceType, experienceUrl: experienceUrl || undefined,
          welcomeMessage: welcomeMessage || undefined, status,
          shortDescription: shortDescription || undefined, coverImage: coverImage || undefined,
          isPublished, isFeatured, displayOrder,
          sectorId: sectorId || undefined, offeringId: offeringId || undefined,
          buttons: cleanButtons,
          details: cleanDetails,
          luxediaPrimaryColor: luxediaPrimaryColor || undefined,
          luxediaWidgetBgColor: luxediaWidgetBgColor || undefined,
          luxediaBotMessageColor: luxediaBotMessageColor || undefined,
          luxediaUserMessageColor: luxediaUserMessageColor || undefined,
          luxediaAvatarUrl: luxediaAvatarUrl || undefined,
          luxediaClientLogoUrl: luxediaClientLogoUrl || undefined,
          luxediaLanguage: luxediaLanguage || undefined,
        })
      } else {
        await projectsApi.create({
          name, matterportId: matterportId || undefined, ambassadorName,
          experienceType, experienceUrl: experienceUrl || undefined,
          welcomeMessage: welcomeMessage || undefined, clientId,
          shortDescription: shortDescription || undefined, coverImage: coverImage || undefined,
          isPublished, isFeatured, displayOrder,
          sectorId: sectorId || undefined, offeringId: offeringId || undefined,
          buttons: cleanButtons,
          details: cleanDetails,
        })
      }
      router.push('/dashboard/projets')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Chargement...</div>
  }

  return (
    <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/dashboard/projets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="back-btn">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>Expérience immersive</p>
        </div>
      </div>

      <div style={{ padding: '28px 40px', maxWidth: '760px' }}>
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px', marginBottom: '24px' }}>{error}</div>
        )}

        {/* SECTION 1 — Informations */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Informations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nom du projet *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mercedes CLE 53 AMG" style={inputStyle} className="dash-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Client *</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputStyle} className="dash-input">
                  <option value="">Choisir un client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Secteur</label>
                <select value={sectorId} onChange={(e) => setSectorId(e.target.value)} style={inputStyle} className="dash-input">
                  <option value="">Aucun</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Offre / Service</label>
                <select value={offeringId} onChange={(e) => setOfferingId(e.target.value)} style={inputStyle} className="dash-input">
                  <option value="">Aucune</option>
                  {offerings.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ordre d'affichage</label>
                <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} style={inputStyle} className="dash-input" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description courte (carte vitrine)</label>
              <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Cabriolet sport haute performance avec expérience immersive." style={inputStyle} className="dash-input" />
            </div>
            <div>
              <label style={labelStyle}>Image de couverture (URL)</label>
              <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." style={inputStyle} className="dash-input" />
            </div>
          </div>
        </div>

        {/* SECTION 2 — Expérience immersive */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Expérience immersive</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Type d'expérience</label>
              <select value={experienceType} onChange={(e) => setExperienceType(e.target.value)} style={inputStyle} className="dash-input">
                <option value="Matterport">Matterport (jumeau numérique 3D)</option>
                <option value="Tour360">360° (Glo3D, Kuula...)</option>
                <option value="IAOnly">IA seule (chat plein écran)</option>
              </select>
            </div>

            {experienceType === 'Matterport' && (
              <div>
                <label style={labelStyle}>Matterport ID</label>
                <input type="text" value={matterportId} onChange={(e) => setMatterportId(e.target.value)} placeholder="WJzvgHF44zq" style={inputStyle} className="dash-input" />
              </div>
            )}

            {experienceType === 'Tour360' && (
              <div>
                <label style={labelStyle}>URL de l'expérience 360°</label>
                <input type="text" value={experienceUrl} onChange={(e) => setExperienceUrl(e.target.value)} placeholder="https://glo3d.net/xxxxx" style={inputStyle} className="dash-input" />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Nom de l'ambassadeur IA</label>
                <input type="text" value={ambassadorName} onChange={(e) => setAmbassadorName(e.target.value)} placeholder="Luxedia" style={inputStyle} className="dash-input" />
              </div>
              {isEdit && (
                <div>
                  <label style={labelStyle}>Statut</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle} className="dash-input">
                    <option value="Active">Actif</option>
                    <option value="Draft">Brouillon</option>
                    <option value="Archived">Archivé</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Message d'accueil de Luxedia</label>
              <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={2} placeholder="Bienvenue ! Je suis Luxedia, votre assistant. Comment puis-je vous aider ?" style={{ ...inputStyle, resize: 'vertical' as const }} className="dash-input" />
            </div>
          </div>
        </div>

        {/* SECTION 3 — Personnalisation Luxedia */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={sectionTitle}>Personnalisation Luxedia</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* 4 color pickers en grille 2 colonnes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {([
                ['Couleur principale', luxediaPrimaryColor, setLuxediaPrimaryColor],
                ['Fond du widget', luxediaWidgetBgColor, setLuxediaWidgetBgColor],
                ['Bulle Luxedia', luxediaBotMessageColor, setLuxediaBotMessageColor],
                ['Bulle utilisateur', luxediaUserMessageColor, setLuxediaUserMessageColor],
              ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]).map(([label, val, set]) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color" value={val}
                      onChange={(e) => set(e.target.value)}
                      style={{ width: '38px', height: '36px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', padding: '2px 3px', backgroundColor: '#1a1a1a', flexShrink: 0 }}
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

            {/* URLs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Avatar Luxedia (URL)</label>
                <input type="text" value={luxediaAvatarUrl} onChange={(e) => setLuxediaAvatarUrl(e.target.value)} placeholder="https://... ou /luxedia-avatar.png" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={labelStyle}>Logo client (URL)</label>
                <input type="text" value={luxediaClientLogoUrl} onChange={(e) => setLuxediaClientLogoUrl(e.target.value)} placeholder="https://... ou /logo-dark.png" style={inputStyle} className="dash-input" />
              </div>
            </div>

            {/* Langue */}
            <div style={{ maxWidth: '200px' }}>
              <label style={labelStyle}>Langue</label>
              <select value={luxediaLanguage} onChange={(e) => setLuxediaLanguage(e.target.value)} style={inputStyle} className="dash-input">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

          </div>
        </div>

        {/* SECTION 4 — Boutons d'action */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Boutons d'action</p>
            <button onClick={addButton} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: GOLD, background: 'none', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          {buttons.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Aucun bouton. Ajoutez des actions (Réserver, Appeler, Itinéraire...).</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {buttons.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={b.label} onChange={(e) => updateButton(i, 'label', e.target.value)} placeholder="Réserver un essai" style={inputStyle} className="dash-input" />
                  <input type="text" value={b.url} onChange={(e) => updateButton(i, 'url', e.target.value)} placeholder="https://... ou tel:+1..." style={inputStyle} className="dash-input" />
                  <select value={b.action} onChange={(e) => updateButton(i, 'action', e.target.value)} style={inputStyle} className="dash-input">
                    <option value="link">Lien</option>
                    <option value="form">Formulaire</option>
                    <option value="call">Appel</option>
                  </select>
                  <button onClick={() => removeButton(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="del-btn" title="Retirer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4 — Caractéristiques (Prix, Kilométrage, Superficie...) */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Caractéristiques</p>
            <button onClick={addDetail} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: GOLD, background: 'none', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: '0 0 16px 0' }}>
            Infos affichées sur la carte (ex: Prix → 89 900 $, Kilométrage → 12 000 km, Superficie → 2 400 pi²). Masquez celles que vous ne voulez pas montrer.
          </p>
          {details.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Aucune caractéristique.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {details.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto auto', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={d.label} onChange={(e) => updateDetail(i, 'label', e.target.value)} placeholder="Prix" style={inputStyle} className="dash-input" />
                  <input type="text" value={d.value} onChange={(e) => updateDetail(i, 'value', e.target.value)} placeholder="89 900 $" style={inputStyle} className="dash-input" />
                  <button onClick={() => updateDetail(i, 'isVisible', !d.isVisible)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1a', color: d.isVisible ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }} title={d.isVisible ? 'Visible' : 'Masqué'}>
                    {d.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {d.isVisible ? 'Visible' : 'Masqué'}
                  </button>
                  <button onClick={() => removeDetail(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '38px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="del-btn" title="Retirer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION — Documents (édition uniquement) */}
        {isEdit && (
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <p style={sectionTitle}>Documents</p>

            {/* Zone upload */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: GOLD, background: 'none', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
                  <Upload size={12} />
                  {uploadingDoc ? 'Upload...' : 'Ajouter un PDF'}
                  <input
                    type="file" accept=".pdf" style={{ display: 'none' }}
                    disabled={uploadingDoc}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDocument(f); e.target.value = '' }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={uploadIsInternal} onChange={(e) => setUploadIsInternal(e.target.checked)} style={{ accentColor: GOLD }} />
                  Document interne (non transmis à Luxedia)
                </label>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>PDF uniquement — max 20 MB</p>
            </div>

            {/* Liste */}
            {docsLoading ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Chargement...</p>
            ) : documents.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Aucun document. Uploadez des PDFs pour alimenter Luxedia IA.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <FileText size={13} style={{ color: GOLD, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '12px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '999px', flexShrink: 0,
                      backgroundColor: doc.isInternal ? 'rgba(255,255,255,0.06)' : doc.isIndexed ? 'rgba(74,222,128,0.1)' : 'rgba(212,175,55,0.1)',
                      color: doc.isInternal ? 'rgba(255,255,255,0.3)' : doc.isIndexed ? '#4ade80' : GOLD,
                    }}>
                      {doc.isInternal ? 'Interne' : doc.isIndexed ? 'Indexé' : 'En attente'}
                    </span>
                    <button
                      onClick={() => handleToggleCategory(doc)}
                      title={doc.isInternal ? 'Rendre disponible pour Luxedia' : 'Marquer interne'}
                      style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#111', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                      className="add-btn"
                    >
                      {doc.isInternal ? '→ IA' : '→ Interne'}
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer', flexShrink: 0 }}
                      className="del-btn" title="Supprimer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5 — Publication */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <p style={sectionTitle}>Publication</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsPublished(!isPublished)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1a', color: isPublished ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px' }}>
              {isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
              {isPublished ? 'Publié sur le site' : 'Brouillon (non publié)'}
            </button>
            <button onClick={() => setIsFeatured(!isFeatured)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1a', color: isFeatured ? GOLD : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px' }}>
              <Star size={14} style={isFeatured ? { fill: GOLD } : undefined} />
              {isFeatured ? 'En vedette' : 'Pas en vedette'}
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: '12px 0 0 0' }}>
            Un projet doit être « Publié » pour apparaître dans les Réalisations du site. « En vedette » le met en avant sur l'accueil.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '11px 24px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
            <Check size={14} /> {saving ? 'Sauvegarde...' : (isEdit ? 'Enregistrer' : 'Créer le projet')}
          </button>
          <Link href="/dashboard/projets" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px 24px', cursor: 'pointer', textDecoration: 'none' }}>Annuler</Link>
        </div>
      </div>

      <style>{`
        .back-btn:hover   { color: ${GOLD} !important; border-color: rgba(212,175,55,0.3) !important; }
        .add-btn:hover    { background-color: rgba(212,175,55,0.1) !important; }
        .del-btn:hover    { background-color: rgba(248,113,113,0.1) !important; }
        .save-btn:hover   { background-color: #c9a84c !important; }
        .dash-input:focus { border-color: ${GOLD} !important; }
      `}</style>
    </main>
  )
}