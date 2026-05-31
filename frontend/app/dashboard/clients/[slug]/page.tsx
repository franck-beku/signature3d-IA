/**
 * Fiche Client — Dashboard
 * Version: 9.0 — Upload contrat PDF connecté au backend
 */

'use client'
import QRCodeLogo from '@/components/dashboard/QRCodeLogo'
import DocumentUpload from '@/components/dashboard/DocumentUpload'
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, ExternalLink, QrCode, Upload, Plus, Trash2, AlertTriangle, Pencil, X, Check, Copy, Code, FileText, ExternalLink as OpenIcon } from 'lucide-react'
import { clientsApi, projectsApi, type ClientDto, type ProjectDto } from '@/lib/api'

const GOLD = '#d4af37'
const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://signature3dia.com'
const API_URL  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'

const TYPES_ACTION = [
  { value: 'link',  label: 'Lien URL'   },
  { value: 'call',  label: 'Téléphone'  },
  { value: 'form',  label: 'Formulaire' },
]

const statusStyle = (s: string) => {
  if (s === 'Active' || s === 'actif')  return { bg: 'rgba(74,222,128,0.1)',   color: '#4ade80' }
  if (s === 'Draft')                    return { bg: 'rgba(212,175,55,0.1)',   color: GOLD }
  return                                       { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
}

const priorityLabel = (p: number) => {
  if (p === 1) return { label: 'Priorité haute',    color: '#f87171' }
  if (p === 2) return { label: 'Priorité moyenne',  color: '#facc15' }
  return               { label: 'Priorité normale', color: '#4ade80' }
}

const clientStatusStyle = (s: string) => {
  if (s === 'Actif')   return { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' }
  if (s === 'EnCours') return { bg: 'rgba(212,175,55,0.1)', color: GOLD }
  return                      { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
}

function isDeliveryUrgent(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
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

interface EditProject {
  id: string; name: string; matterportId: string; status: string
  buttons: { id: string; label: string; url: string; action: string; order: number }[]
}

function newButton() {
  return { id: Date.now().toString(), label: '', url: '', action: 'link', order: 0 }
}

/* ── Modal Contrat PDF ── */
function ContractModal({
  clientId, clientName, existingUrl, onClose, onUploaded
}: {
  clientId: string
  clientName: string
  existingUrl?: string | null
  onClose: () => void
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 50 MB.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_URL}/api/clients/${clientId}/contract`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Erreur lors de l\'upload.')
      }

      const data = await res.json()
      onUploaded(data.contractFileUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Entente / Contrat</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{clientName}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>

        {/* Contrat existant */}
        {existingUrl && (
          <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#4ade80', fontSize: '13px', margin: '0 0 2px', fontWeight: 500 }}>Contrat existant</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>Un contrat PDF est déjà uploadé</p>
            </div>
            <a href={existingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', textDecoration: 'none' }}>
              <OpenIcon size={11} /> Ouvrir
            </a>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Zone upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? GOLD : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging ? 'rgba(212,175,55,0.05)' : 'transparent',
            transition: 'all 0.3s ease',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} style={{ display: 'none' }} />
          <Upload size={28} style={{ color: uploading ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.6)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>
            {uploading ? 'Upload en cours...' : <>{existingUrl ? 'Remplacer le contrat' : 'Glissez le PDF ici ou'} <span style={{ color: GOLD }}>parcourez</span></>}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>PDF uniquement — max 50 MB</p>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '12px', textAlign: 'center', lineHeight: 1.5 }}>
          💡 Ce contrat est confidentiel — visible uniquement dans le dashboard.
        </p>
      </div>
    </div>
  )
}

/* ── Modal Lien + iframe ── */
function LinkModal({ project, onClose }: { project: ProjectDto; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const directUrl  = `${BASE_URL}/embed/${project.slug}`
  const iframeCode = `<iframe\n  src="${directUrl}"\n  width="420"\n  height="620"\n  style="border: none; border-radius: 12px;"\n  title="${project.name}"\n></iframe>`

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Partager l&apos;expérience</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{project.name}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ExternalLink size={14} style={{ color: GOLD }} />
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0 }}>Lien direct</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginBottom: '12px', lineHeight: 1.5 }}>Pour QR code, email, réseaux sociaux.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 12px', overflow: 'hidden' }}>
                <code style={{ color: GOLD, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{directUrl}</code>
              </div>
              <button onClick={() => copy(directUrl, 'link')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${copied === 'link' ? '#4ade80' : 'rgba(255,255,255,0.1)'}`, color: copied === 'link' ? '#4ade80' : 'rgba(255,255,255,0.5)', background: 'none', cursor: 'pointer', flexShrink: 0 }} className="copy-btn">
                {copied === 'link' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'link' ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Code size={14} style={{ color: GOLD }} />
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0 }}>Intégrer sur un site web</p>
            </div>
            <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
              <pre style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>{iframeCode}</pre>
            </div>
            <button onClick={() => copy(iframeCode, 'iframe')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: `1px solid ${copied === 'iframe' ? '#4ade80' : 'rgba(255,255,255,0.1)'}`, color: copied === 'iframe' ? '#4ade80' : 'rgba(255,255,255,0.5)', background: 'none', cursor: 'pointer' }} className="copy-btn">
              {copied === 'iframe' ? <Check size={12} /> : <Copy size={12} />}
              {copied === 'iframe' ? 'Copié !' : 'Copier le code iframe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const slug   = (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) as string

  const [client, setClient]                   = useState<ClientDto | null>(null)
  const [projects, setProjects]               = useState<ProjectDto[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm]     = useState<string | null>(null)
  const [editProject, setEditProject]         = useState<EditProject | null>(null)
  const [qrProject, setQrProject]             = useState<{ slug: string; name: string } | null>(null)
  const [linkProject, setLinkProject]         = useState<ProjectDto | null>(null)
  const [docProject, setDocProject]           = useState<{ id: string; name: string } | null>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [saving, setSaving]                   = useState(false)

  useEffect(() => {
    clientsApi.getBySlug(slug)
      .then(async (c) => {
        setClient(c as ClientDto)
        const projs = await projectsApi.getByClient(c.id)
        setProjects(projs as ProjectDto[])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
        </main>
      </div>
    )
  }

  if (!client || error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>{error ?? 'Client introuvable'}</p>
            <Link href="/dashboard/clients" style={{ color: GOLD, fontSize: '14px', textDecoration: 'none' }}>← Retour aux clients</Link>
          </div>
        </main>
      </div>
    )
  }

  const priority   = priorityLabel(client.priority)
  const contractSt = clientStatusStyle(client.status)
  const urgent     = isDeliveryUrgent(client.deliveryDate)

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveProject = async () => {
    if (!editProject) return
    setSaving(true)
    try {
      const updated = await projectsApi.update(editProject.id, {
        name:           editProject.name,
        matterportId:   editProject.matterportId,
        ambassadorName: 'Luxedia',
        status:         editProject.status,
        buttons:        editProject.buttons.map((b, i) => ({
          label:  b.label,
          url:    b.url,
          action: b.action,
          order:  i,
        })),
      })
      setProjects((prev) => prev.map((p) => p.id === editProject.id ? updated as ProjectDto : p))
      setEditProject(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateButton = (id: string, key: string, value: string) => {
    if (!editProject) return
    setEditProject({ ...editProject, buttons: editProject.buttons.map((b) => b.id === id ? { ...b, [key]: value } : b) })
  }

  const addButton = () => {
    if (!editProject || editProject.buttons.length >= 4) return
    setEditProject({ ...editProject, buttons: [...editProject.buttons, newButton()] })
  }

  const removeButton = (id: string) => {
    if (!editProject || editProject.buttons.length <= 1) return
    setEditProject({ ...editProject, buttons: editProject.buttons.filter((b) => b.id !== id) })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard/clients" style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="back-arrow">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>{client.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>{client.sectorName}</p>
                <span style={{ color: priority.color, fontSize: '11px' }}>· {priority.label}</span>
              </div>
            </div>
          </div>
          <Link href={`/dashboard/clients/${slug}/nouveau-projet`} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
            <Plus size={13} /> Nouveau projet
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {urgent && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>Date de livraison proche — {new Date(client.deliveryDate).toLocaleDateString('fr-CA')}</p>
            </div>
          )}

          {/* Infos client */}
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>Informations du client</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }} className="info-grid">
              {[
                { icon: Mail,     label: 'Email',        value: client.email },
                { icon: Phone,    label: 'Téléphone',    value: client.phone ?? '—' },
                { icon: Calendar, label: 'Date contrat', value: new Date(client.contractDate).toLocaleDateString('fr-CA') },
              ].map((info) => (
                <div key={info.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <info.icon size={14} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>{info.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="info-grid">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Calendar size={14} style={{ color: urgent ? '#f87171' : GOLD, flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Date livraison</p>
                  <p style={{ color: urgent ? '#f87171' : 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
                    {new Date(client.deliveryDate).toLocaleDateString('fr-CA')}{urgent && ' ⚠️'}
                  </p>
                </div>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Statut</p>
                <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '999px', backgroundColor: contractSt.bg, color: contractSt.color }}>{client.status}</span>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Entente / Contrat</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setShowContractModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${client.contractFileUrl ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`, color: client.contractFileUrl ? '#4ade80' : 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }}
                    className="upload-btn"
                  >
                    {client.contractFileUrl ? <Check size={11} /> : <Upload size={11} />}
                    {client.contractFileUrl ? 'Contrat uploadé' : 'Uploader PDF'}
                  </button>
                  {client.contractFileUrl && (
                    <a href={client.contractFileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="action-btn" title="Ouvrir le contrat">
                      <OpenIcon size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            {client.notes && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Notes internes</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{client.notes}</p>
              </div>
            )}
          </div>

          {/* Projets */}
          <div>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '16px' }}>Projets — {projects.length}</h2>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', marginBottom: '16px' }}>Aucun projet pour ce client</p>
                <Link href={`/dashboard/clients/${slug}/nouveau-projet`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }}>
                  <Plus size={13} /> Créer le premier projet
                </Link>
              </div>
            ) : (
              <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Projet</th>
                      <th style={thStyle}>Statut</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, i) => {
                      const st = statusStyle(project.status)
                      return (
                        <React.Fragment key={project.id}>
                          <tr style={{ borderBottom: deleteConfirm === project.id ? 'none' : (i < projects.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none') }} className="proj-row">
                            <td style={{ padding: '14px 16px' }}>
                              <p style={{ color: 'white', fontWeight: 500, fontSize: '13px', margin: 0 }}>{project.name}</p>
                              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '2px 0 0' }}>{project.matterportId || 'IA seule'}</p>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: st.bg, color: st.color }}>{project.status}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{new Date(project.createdAt).toLocaleDateString('fr-CA')}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <button onClick={() => setLinkProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }} className="action-btn">
                                  <ExternalLink size={11} /> Lien
                                </button>
                                <button onClick={() => setQrProject({ slug: project.slug, name: project.name })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }} className="action-btn">
                                  <QrCode size={11} /> QR
                                </button>
                                <button onClick={() => setDocProject({ id: project.id, name: project.name })} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }} className="action-btn">
                                  <FileText size={11} /> PDF
                                </button>
                                <button
                                  onClick={() => setEditProject({ id: project.id, name: project.name, matterportId: project.matterportId ?? '', status: project.status, buttons: project.buttons.length > 0 ? project.buttons.map(b => ({ ...b })) : [newButton()] })}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: `1px solid rgba(212,175,55,0.2)`, color: GOLD, background: 'none', cursor: 'pointer' }}
                                  className="edit-btn"
                                >
                                  <Pencil size={11} /> Modifier
                                </button>
                                <button onClick={() => setDeleteConfirm(deleteConfirm === project.id ? null : project.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="delete-btn">
                                  <Trash2 size={11} /> Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                          {deleteConfirm === project.id && (
                            <tr>
                              <td colSpan={4} style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.05)', borderBottom: i < projects.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                                  <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>Supprimer <strong>{project.name}</strong> ? Cette action est irréversible.</p>
                                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                    <button onClick={() => handleDeleteProject(project.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#f87171', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Modifier Projet */}
      {editProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: 0 }}>Modifier le projet</h2>
              <button onClick={() => setEditProject(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn">
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Nom du projet</label>
                <input type="text" value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>ID Matterport <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>(vide = IA seule)</span></label>
                <input type="text" value={editProject.matterportId} onChange={(e) => setEditProject({ ...editProject, matterportId: e.target.value })} placeholder="Ex: WJzvgHF44zq" style={inputStyle} className="dash-input" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Boutons ({editProject.buttons.length}/4)</label>
                  {editProject.buttons.length < 4 && (
                    <button onClick={addButton} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px', borderRadius: '6px', border: `1px solid ${GOLD}`, color: GOLD, background: 'none', cursor: 'pointer' }} className="add-btn">
                      <Plus size={11} /> Ajouter
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editProject.buttons.map((btn, i) => (
                    <div key={btn.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Bouton {i + 1}</span>
                        {editProject.buttons.length > 1 && (
                          <button onClick={() => removeButton(btn.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }} className="del-btn">
                            <Trash2 size={10} /> Supprimer
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: '8px' }} className="btn-row">
                        <input type="text" value={btn.label} onChange={(e) => updateButton(btn.id, 'label', e.target.value)} placeholder="Nom du bouton" style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                        <select value={btn.action} onChange={(e) => updateButton(btn.id, 'action', e.target.value)} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input">
                          {TYPES_ACTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input type="text" value={btn.url} onChange={(e) => updateButton(btn.id, 'url', e.target.value)} placeholder={btn.action === 'call' ? 'tel:+1...' : 'https://'} style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} className="dash-input" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveProject} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
                  <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => setEditProject(null)} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload PDF Luxedia */}
      {docProject && (
        <DocumentUpload projectId={docProject.id} projectName={docProject.name} onClose={() => setDocProject(null)} />
      )}

      {/* Modal Contrat */}
      {showContractModal && client && (
        <ContractModal
          clientId={client.id}
          clientName={client.name}
          existingUrl={client.contractFileUrl}
          onClose={() => setShowContractModal(false)}
          onUploaded={(url) => {
            setClient({ ...client, contractFileUrl: url })
            setShowContractModal(false)
          }}
        />
      )}

      {linkProject && <LinkModal project={linkProject} onClose={() => setLinkProject(null)} />}

      {qrProject && (
        <QRCodeLogo url={`${BASE_URL}/embed/${qrProject.slug}`} projectName={qrProject.name} onClose={() => setQrProject(null)} />
      )}

      <style>{`
        .back-arrow:hover  { color: ${GOLD} !important; }
        .new-btn:hover     { background-color: #c9a84c !important; }
        .proj-row:hover    { background-color: rgba(255,255,255,0.02) !important; }
        .action-btn:hover  { color: ${GOLD} !important; border-color: rgba(212,175,55,0.3) !important; }
        .edit-btn:hover    { background-color: rgba(212,175,55,0.1) !important; }
        .delete-btn:hover  { background-color: rgba(248,113,113,0.1) !important; }
        .upload-btn:hover  { color: ${GOLD} !important; border-color: rgba(212,175,55,0.3) !important; }
        .close-btn:hover   { color: white !important; }
        .save-btn:hover    { background-color: #c9a84c !important; }
        .add-btn:hover     { background-color: rgba(212,175,55,0.1) !important; }
        .del-btn:hover     { background-color: rgba(248,113,113,0.08) !important; }
        .copy-btn:hover    { color: ${GOLD} !important; border-color: rgba(212,175,55,0.3) !important; }
        .dash-input:focus  { border-color: ${GOLD} !important; }
        @media (max-width: 900px) { .info-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .btn-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
