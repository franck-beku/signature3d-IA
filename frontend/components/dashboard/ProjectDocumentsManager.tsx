/**
 * ProjectDocumentsManager — Gestion des documents PDF d'un projet (upload/liste/toggle
 * interne-IA/suppression/réindexation). Composant autonome (fetch + state internes) utilisé
 * en modale (fiche client, bouton "PDF" du tableau de projets) et en section inline
 * (formulaire d'édition de projet) — voir la prop `variant`.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, Trash2, X, RefreshCw } from 'lucide-react'
import { documentsApi, type DocumentDto } from '@/lib/api'

interface Props {
  projectId: string
  projectName?: string
  variant?: 'modal' | 'section'
  onClose?: () => void
}

const sectionTitle = {
  fontSize: '11px', color: 'var(--dash-gold)', textTransform: 'uppercase' as const,
  letterSpacing: '0.25em', margin: '0 0 16px 0', fontWeight: 500,
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectDocumentsManager({ projectId, projectName, variant = 'section', onClose }: Props) {
  const [documents, setDocuments]   = useState<DocumentDto[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [uploadIsInternal, setUploadIsInternal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDocsLoading(true)
    documentsApi.getByProject(projectId)
      .then((docs) => setDocuments(docs as DocumentDto[]))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des documents.'))
      .finally(() => setDocsLoading(false))
  }, [projectId])

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 20 MB.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const doc = await documentsApi.upload(projectId, file, uploadIsInternal)
      setDocuments((prev) => [doc as DocumentDto, ...prev])
      setUploadIsInternal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (docId: string) => {
    try {
      await documentsApi.delete(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleReindex = async (docId: string) => {
    try {
      await documentsApi.reindex(docId)
      setDocuments((prev) => prev.map((d) =>
        d.id === docId ? { ...d, isIndexed: true } : d
      ))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
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

  const content = (
    <>
      {variant === 'modal' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Documents PDF</h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>{projectName}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="pdm-close-btn">
            <X size={14} />
          </button>
        </div>
      ) : (
        <p style={sectionTitle}>Documents</p>
      )}

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
            borderRadius: '12px', padding: '24px', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragging ? 'var(--dash-gold-muted)' : 'transparent',
            opacity: uploading ? 0.6 : 1,
          }}
          className="pdm-upload-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            disabled={uploading}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Upload size={24} style={{ color: 'var(--dash-gold-icon)', margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '4px' }}>
            {uploading ? 'Upload en cours...' : <>Glissez un PDF ici ou <span style={{ color: 'var(--dash-gold)' }}>parcourez</span></>}
          </p>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>PDF uniquement — max 20 MB</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dash-text-subtle)', cursor: 'pointer', marginTop: '10px' }}>
          <input type="checkbox" checked={uploadIsInternal} onChange={(e) => setUploadIsInternal(e.target.checked)} style={{ accentColor: 'var(--dash-gold)' }} />
          Document interne (non transmis à Luxedia)
        </label>
      </div>

      {docsLoading ? (
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Chargement...</p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--dash-border)', borderRadius: '10px' }}>
          <FileText size={24} style={{ color: 'var(--dash-border-input)', margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucun document. Uploadez des PDFs pour alimenter Luxedia IA.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: 'var(--dash-input)', borderRadius: '8px', border: '1px solid var(--dash-border)' }}>
              <FileText size={13} style={{ color: 'var(--dash-gold)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'var(--dash-text)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0 }}>{formatSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString('fr-CA')}</p>
              </div>
              <span
                title={!doc.isInternal ? doc.indexingError : undefined}
                style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '999px', flexShrink: 0,
                  backgroundColor: doc.isInternal ? 'var(--dash-border)' : doc.isIndexed ? 'var(--dash-success-bg)' : 'var(--dash-gold-muted)',
                  color: doc.isInternal ? 'var(--dash-text-muted)' : doc.isIndexed ? 'var(--dash-success)' : 'var(--dash-gold)',
                  cursor: !doc.isInternal && doc.indexingError ? 'help' : 'default',
                }}>
                {doc.isInternal ? 'Interne' : doc.isIndexed ? 'Indexé' : 'En attente'}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {!doc.isIndexed && !doc.isInternal && (
                  <button onClick={() => handleReindex(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-gold)' }} className="pdm-reindex-btn" title="Réindexer">
                    <RefreshCw size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleToggleCategory(doc)}
                  title={doc.isInternal ? 'Rendre disponible pour Luxedia' : 'Marquer interne'}
                  style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-surface)', color: 'var(--dash-text-subtle)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                  className="pdm-toggle-btn"
                >
                  {doc.isInternal ? '→ IA' : '→ Interne'}
                </button>
                <button onClick={() => handleDelete(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-error)' }} className="pdm-del-btn" title="Supprimer">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .pdm-upload-zone:hover { border-color: var(--dash-gold-ring) !important; }
        .pdm-close-btn:hover   { color: var(--dash-text) !important; }
        .pdm-del-btn:hover     { background-color: var(--dash-error-bg) !important; }
        .pdm-reindex-btn:hover { background-color: var(--dash-gold-muted) !important; }
        .pdm-toggle-btn:hover  { background-color: var(--dash-gold-muted) !important; }
      `}</style>
    </>
  )

  if (variant === 'modal') {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
      {content}
    </div>
  )
}
