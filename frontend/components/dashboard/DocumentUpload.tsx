/**
 * DocumentUpload — Composant d'upload PDF pour un projet
 * Utilisé dans la fiche client pour chaque projet
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, Trash2, X, Check, RefreshCw } from 'lucide-react'
import { documentsApi, type DocumentDto } from '@/lib/api'

const GOLD = '#d4af37'

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

  /* Charger les documents existants */
  useEffect(() => {
    documentsApi.getByProject(projectId)
      .then((docs) => setDocuments(docs as DocumentDto[]))
      .catch(console.error)
  }, [projectId])

  /* Gérer l'upload */
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
      <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Documents PDF</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{projectName}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Zone upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? GOLD : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragging ? 'rgba(212,175,55,0.05)' : 'transparent',
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
          <Upload size={28} style={{ color: uploading ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.6)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>
            {uploading ? 'Upload en cours...' : <>Glissez un PDF ici ou <span style={{ color: GOLD }}>parcourez</span></>}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>PDF uniquement — max 50 MB</p>
        </div>

        {/* Liste documents */}
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '10px' }}>
            <FileText size={24} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 10px' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun document uploadé</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </p>
            {documents.map((doc) => (
              <div key={doc.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={14} style={{ color: GOLD }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: '13px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{formatSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString('fr-CA')}</p>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: doc.isIndexed ? 'rgba(74,222,128,0.1)' : 'rgba(212,175,55,0.1)', color: doc.isIndexed ? '#4ade80' : GOLD, flexShrink: 0 }}>
                  {doc.isIndexed ? 'Indexé' : 'En attente'}
                </span>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!doc.isIndexed && (
                    <button onClick={() => handleReindex(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid rgba(212,175,55,0.2)`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }} className="reindex-btn" title="Indexer">
                      <RefreshCw size={12} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }} className="del-btn" title="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0, lineHeight: 1.6 }}>
            💡 Les documents indexés alimentent Luxedia IA. L&apos;indexation se fait automatiquement après l&apos;upload.
          </p>
        </div>
      </div>

      <style>{`
        .upload-zone:hover { border-color: rgba(212,175,55,0.3) !important; }
        .close-btn:hover { color: white !important; }
        .del-btn:hover { background-color: rgba(248,113,113,0.1) !important; }
        .reindex-btn:hover { background-color: rgba(212,175,55,0.1) !important; }
      `}</style>
    </div>
  )
}
