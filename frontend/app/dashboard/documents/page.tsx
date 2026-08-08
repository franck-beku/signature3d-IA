/**
 * Documents — Dashboard Signature 3D IA
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Upload, FileText, Trash2, Search } from 'lucide-react'

interface Document {
  id: string; name: string; project: string
  size: string; isIndexed: boolean; indexingError?: string; uploadedAt: string
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
  borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [search, setSearch]               = useState('')
  const [filterProject, setFilterProject] = useState('Tous')
  const [isDragging, setIsDragging]       = useState(false)

  const projects = ['Tous', ...Array.from(new Set(documents.map((d) => d.project)))]

  const filtered = documents.filter((d) => {
    const matchSearch  = d.name.toLowerCase().includes(search.toLowerCase())
    const matchProject = filterProject === 'Tous' || d.project === filterProject
    return matchSearch && matchProject
  })

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Documents</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              {documents.length} document{documents.length > 1 ? 's' : ''} — alimentent Luxedia IA
            </p>
          </div>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Zone upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
            style={{
              border: `2px dashed ${isDragging ? 'var(--dash-gold)' : 'var(--dash-border-input)'}`,
              borderRadius: '14px', padding: '40px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.3s ease',
              backgroundColor: isDragging ? 'var(--dash-gold-muted)' : 'transparent',
            }}
            className="upload-zone"
          >
            <Upload size={28} style={{ color: 'var(--dash-gold-icon)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '4px' }}>
              Glissez vos documents ici ou <span style={{ color: 'var(--dash-gold)' }}>parcourez vos fichiers</span>
            </p>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>PDF ou Word (.docx) — max 20 MB par fichier</p>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
              <input
                type="text" placeholder="Rechercher un document..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '8px', paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px', fontSize: '13px', color: 'var(--dash-text)', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            {documents.length > 0 && (
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', color: 'var(--dash-text-subtle)', outline: 'none' }}>
                {projects.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>

          {/* Table ou état vide */}
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
              <FileText size={32} style={{ color: 'var(--dash-border-input)', margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '6px' }}>
                Aucun document uploadé
              </p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>
                Uploadez des PDFs pour alimenter Luxedia IA — fiches techniques, menus, catalogues, conditions de vente.
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle} className="dash-label">Document</th>
                    <th style={thStyle} className="dash-label">Projet</th>
                    <th style={thStyle} className="dash-label">Taille</th>
                    <th style={thStyle} className="dash-label">Statut IA</th>
                    <th style={thStyle} className="dash-label">Date</th>
                    <th style={thStyle} className="dash-label">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => (
                    <tr key={doc.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none', transition: 'background 0.2s ease' }} className="doc-row">
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={13} style={{ color: 'var(--dash-gold)' }} />
                          </div>
                          <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>{doc.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{doc.project}</span></td>
                      <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{doc.size}</span></td>
                      <td style={{ padding: '14px 16px' }}>
                        <span title={doc.indexingError} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: doc.isIndexed ? 'var(--dash-success-bg)' : 'var(--dash-gold-muted)', color: doc.isIndexed ? 'var(--dash-success)' : 'var(--dash-gold)', cursor: doc.indexingError ? 'help' : 'default' }}>
                          {doc.isIndexed ? 'Indexé' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{new Date(doc.uploadedAt).toLocaleDateString('fr-CA')}</span></td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleDelete(doc.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-muted)', background: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="del-btn">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                        Aucun document trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Info */}
          <div style={{ padding: '14px 16px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', borderRadius: '10px' }}>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
              💡 Les documents uploadés alimentent directement Luxedia IA. Plus vous uploadez de documents précis, plus les réponses seront pertinentes pour vos visiteurs.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .upload-zone:hover { border-color: var(--dash-gold-ring) !important; }
        .doc-row:hover { background-color: var(--dash-hover) !important; }
        .del-btn:hover { color: var(--dash-error) !important; border-color: var(--dash-error-ring) !important; }
      `}</style>
    </div>
  )
}
