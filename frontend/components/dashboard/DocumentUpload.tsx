/**
 * DocumentUpload — Composant d'upload PDF pour un projet
 * Utilisé dans la fiche client pour chaque projet
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, Trash2, X, RefreshCw } from 'lucide-react'
import { documentsApi, type DocumentDto } from '@/lib/api'

interface Props {
  projectId: string
  projectName: string
  onClose: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentUpload({ projectId, projectName, onClose }: Props) {
  const [documents, setDocuments]   = useState<DocumentDto[]>([])
  const [uploading, setUploading]   = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    documentsApi.getByProject(projectId)
      .then((docs) => setDocuments(docs as DocumentDto[]))
      .catch(console.error)
  }, [projectId])

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
      const doc = await documentsApi.upload(projectId, file)
      setDocuments((prev) => [doc as DocumentDto, ...prev])
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (docId: string) => {
    try {
      await documentsApi.delete(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleReindex = async (docId: string) => {
    try {
      await documentsApi.reindex(docId)
      setDocuments((prev) => prev.map((d) =>
        d.id === docId ? { ...d, isIndexed: true } : d
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Documents PDF</h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>{projectName}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragging ? 'var(--dash-gold-muted)' : 'transparent',
            marginBottom: '20px',
            opacity: uploading ? 0.6 : 1,
          }}
          className="upload-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Upload size={28} style={{ color: uploading ? 'rgba(200,164,93,0.3)' : 'rgba(200,164,93,0.6)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '4px' }}>
            {uploading ? 'Upload en cours...' : <>Glissez un PDF ici ou <span style={{ color: 'var(--dash-gold)' }}>parcourez</span></>}
          </p>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>PDF uniquement — max 50 MB</p>
        </div>

        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--dash-border)', borderRadius: '10px' }}>
            <FileText size={24} style={{ color: 'var(--dash-border-input)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun document uploadé</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="dash-micro-label" style={{ marginBottom: '4px' }}>
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </p>
            {documents.map((doc) => (
              <div key={doc.id} style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={14} style={{ color: 'var(--dash-gold)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0 }}>{formatSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString('fr-CA')}</p>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: doc.isIndexed ? 'var(--dash-success-bg)' : 'var(--dash-gold-muted)', color: doc.isIndexed ? 'var(--dash-success)' : 'var(--dash-gold)', flexShrink: 0 }}>
                  {doc.isIndexed ? 'Indexé' : 'En attente'}
                </span>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!doc.isIndexed && (
                    <button onClick={() => handleReindex(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-gold)' }} className="reindex-btn" title="Indexer">
                      <RefreshCw size={12} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-error)' }} className="del-btn" title="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0, lineHeight: 1.6 }}>
            💡 Les documents indexés alimentent Luxedia IA. L&apos;indexation se fait automatiquement après l&apos;upload.
          </p>
        </div>
      </div>

      <style>{`
        .upload-zone:hover { border-color: var(--dash-gold-ring) !important; }
        .close-btn:hover   { color: var(--dash-text) !important; }
        .del-btn:hover     { background-color: var(--dash-error-bg) !important; }
        .reindex-btn:hover { background-color: var(--dash-gold-muted) !important; }
      `}</style>
    </div>
  )
}
