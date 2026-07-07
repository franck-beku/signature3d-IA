'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, ExternalLink as OpenIcon } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'

/* ── Modal Contrat PDF ── */
export default function ContractModal({
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
    if (!file.name.endsWith('.pdf')) { setError('Seuls les fichiers PDF sont acceptés.'); return }
    if (file.size > 50 * 1024 * 1024) { setError('Le fichier ne doit pas dépasser 50 MB.'); return }
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
      if (!res.ok) { const data = await res.json(); throw new Error(data.message ?? 'Erreur lors de l\'upload.') }
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
      <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Entente / Contrat</h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>{clientName}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>

        {existingUrl && (
          <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: 'var(--dash-success-bg)', border: '1px solid var(--dash-success-ring)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={16} style={{ color: 'var(--dash-success)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--dash-success)', fontSize: '13px', margin: '0 0 2px', fontWeight: 500 }}>Contrat existant</p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0 }}>Un contrat PDF est déjà uploadé</p>
            </div>
            <a href={existingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-success-ring)', color: 'var(--dash-success)', textDecoration: 'none' }}>
              <OpenIcon size={11} /> Ouvrir
            </a>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px' }}>{error}</div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging ? 'var(--dash-gold-muted)' : 'transparent',
            transition: 'all 0.3s ease',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} style={{ display: 'none' }} />
          <Upload size={28} style={{ color: uploading ? 'rgba(200,164,93,0.3)' : 'rgba(200,164,93,0.6)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '4px' }}>
            {uploading ? 'Upload en cours...' : <>{existingUrl ? 'Remplacer le contrat' : 'Glissez le PDF ici ou'} <span style={{ color: 'var(--dash-gold)' }}>parcourez</span></>}
          </p>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>PDF uniquement — max 50 MB</p>
        </div>

        <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '12px', textAlign: 'center', lineHeight: 1.5 }}>
          💡 Ce contrat est confidentiel — visible uniquement dans le dashboard.
        </p>
      </div>
    </div>
  )
}
