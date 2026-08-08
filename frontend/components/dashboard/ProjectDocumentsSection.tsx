/**
 * ProjectDocumentsSection — Section "Documents" du formulaire projet
 * Extrait de ProjectForm.tsx (édition uniquement)
 */

'use client'

import { FileText, Upload, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import type { DocumentDto } from '@/lib/api'

const sectionTitle = {
  fontSize: '11px', color: 'var(--dash-gold)', textTransform: 'uppercase' as const,
  letterSpacing: '0.25em', margin: '0 0 16px 0', fontWeight: 500,
}

interface Props {
  documents: DocumentDto[]
  docsLoading: boolean
  uploadingDoc: boolean
  uploadIsInternal: boolean
  onUploadIsInternalChange: (value: boolean) => void
  onUpload: (file: File) => void
  onToggleCategory: (doc: DocumentDto) => void
  onDelete: (id: string) => void
  onRequestOcr: (id: string) => void
  ocrPendingIds: Set<string>
}

export default function ProjectDocumentsSection({
  documents, docsLoading, uploadingDoc, uploadIsInternal,
  onUploadIsInternalChange, onUpload, onToggleCategory, onDelete,
  onRequestOcr, ocrPendingIds,
}: Props) {
  return (
    <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
      <p style={sectionTitle}>Documents</p>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dash-gold)', background: 'none', border: '1px solid var(--dash-gold-ring)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }} className="add-btn">
            <Upload size={12} />
            {uploadingDoc ? 'Upload...' : 'Ajouter un document'}
            <input
              type="file" accept=".pdf,.docx" style={{ display: 'none' }}
              disabled={uploadingDoc}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dash-text-subtle)', cursor: 'pointer' }}>
            <input type="checkbox" checked={uploadIsInternal} onChange={(e) => onUploadIsInternalChange(e.target.checked)} style={{ accentColor: 'var(--dash-gold)' }} />
            Document interne (non transmis à Luxedia)
          </label>
        </div>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>PDF ou Word (.docx) — max 20 MB</p>
      </div>

      {docsLoading ? (
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Chargement...</p>
      ) : documents.length === 0 ? (
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', margin: 0 }}>Aucun document. Uploadez des PDFs pour alimenter Luxedia IA.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: 'var(--dash-input)', borderRadius: '8px', border: '1px solid var(--dash-border)' }}>
              <FileText size={13} style={{ color: 'var(--dash-gold)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '12px', color: 'var(--dash-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)', flexShrink: 0 }}>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
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
              {doc.isIndexed && doc.ocrFailedPageNumbers?.length > 0 ? (
                <span
                  title={`Page${doc.ocrFailedPageNumbers.length > 1 ? 's' : ''} ${doc.ocrFailedPageNumbers.join(', ')} — OCR tenté sans succès, probablement illisible (image de mauvaise qualité ou sans texte réel).`}
                  style={{ display: 'flex', flexShrink: 0, cursor: 'help' }}
                >
                  <AlertTriangle size={13} style={{ color: 'var(--dash-error)' }} />
                </span>
              ) : doc.isIndexed && doc.lowTextPageNumbers?.length > 0 && (
                <>
                  <span
                    title={`Extraction possiblement incomplète — page${doc.lowTextPageNumbers.length > 1 ? 's' : ''} ${doc.lowTextPageNumbers.join(', ')} contiennent très peu de texte (probablement des encadrés en image). Le contenu de ces pages peut être absent des réponses de l'IA.`}
                    style={{ display: 'flex', flexShrink: 0, cursor: 'help' }}
                  >
                    <AlertTriangle size={13} style={{ color: 'var(--dash-gold)' }} />
                  </span>
                  <button
                    onClick={() => onRequestOcr(doc.id)}
                    disabled={ocrPendingIds.has(doc.id)}
                    title={ocrPendingIds.has(doc.id) ? 'OCR en cours...' : "Relancer l'OCR sur les pages faibles"}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', background: 'none', color: 'var(--dash-gold)', cursor: ocrPendingIds.has(doc.id) ? 'default' : 'pointer', flexShrink: 0, opacity: ocrPendingIds.has(doc.id) ? 0.5 : 1 }}
                  >
                    <RefreshCw size={11} className={ocrPendingIds.has(doc.id) ? 'ocr-spin' : undefined} />
                  </button>
                </>
              )}
              <button
                onClick={() => onToggleCategory(doc)}
                title={doc.isInternal ? 'Rendre disponible pour Luxedia' : 'Marquer interne'}
                style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', backgroundColor: 'var(--dash-surface)', color: 'var(--dash-text-subtle)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                className="add-btn"
              >
                {doc.isInternal ? '→ IA' : '→ Interne'}
              </button>
              <button
                onClick={() => onDelete(doc.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer', flexShrink: 0 }}
                className="del-btn" title="Supprimer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ocr-spin { animation: ocr-spin 1s linear infinite; }
        @keyframes ocr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
