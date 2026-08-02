/**
 * Projets — Dashboard Signature Immersion
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, ExternalLink, Trash2, Pencil, AlertTriangle, Star } from 'lucide-react'
import Link from 'next/link'
import { projectsApi, type ProjectDto } from '@/lib/api'

const thStyle = {
  textAlign: 'left' as const, padding: '14px 16px',
  borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

export default function ProjetsPage() {
  const [projects, setProjects]           = useState<ProjectDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState<'tous' | 'publies' | 'brouillons'>('tous')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    projectsApi.getAll()
      .then((res) => setProjects(res as ProjectDto[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    try {
      await projectsApi.delete(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setDeleteConfirm(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const filtered = projects
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        (p.sectorName ?? '').toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        filter === 'tous' ||
        (filter === 'publies' && p.isPublished) ||
        (filter === 'brouillons' && !p.isPublished)
      return matchSearch && matchFilter
    })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Projets</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              {loading ? '...' : `${projects.length} projet${projects.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/dashboard/projets/nouveau" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
            <Plus size={13} /> Nouveau projet
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>{error}</div>
          )}

          {/* Recherche + filtres */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '320px' }}>
              <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
              <input type="text" placeholder="Projet, client, secteur..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} className="dash-input" />
            </div>
            {([['tous', 'Tous'], ['publies', 'Publiés'], ['brouillons', 'Brouillons']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  fontSize: '12px', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: filter === key ? '1px solid var(--dash-gold)' : '1px solid var(--dash-border-input)',
                  backgroundColor: filter === key ? 'var(--dash-gold)' : 'transparent',
                  color: filter === key ? '#000' : 'var(--dash-text-subtle)',
                  fontWeight: filter === key ? 600 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle} className="dash-label">Projet</th>
                    <th style={thStyle} className="dash-label">Client</th>
                    <th style={thStyle} className="dash-label">Secteur</th>
                    <th style={thStyle} className="dash-label">Offre</th>
                    <th style={thStyle} className="dash-label">Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }} className="dash-label">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const isDeletePending = deleteConfirm === p.id
                    return (
                      <React.Fragment key={p.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none') }} className="client-row">
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: 'var(--dash-gold)', fontSize: '12px', fontWeight: 500 }}>{p.name[0]}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{p.name}</p>
                                {p.isFeatured && <Star size={12} style={{ color: 'var(--dash-gold)', fill: 'var(--dash-gold)' }} />}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{p.clientName}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{p.sectorName ?? '—'}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{p.offeringName ?? '—'}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            {p.isPublished
                              ? <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'var(--dash-success-bg)', color: 'var(--dash-success)' }}>Publié</span>
                              : <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'var(--dash-gold-muted)', color: 'var(--dash-gold)' }}>Brouillon</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <a href={p.embedUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="action-btn" title="Voir l'expérience">
                                <ExternalLink size={12} />
                              </a>
                              <Link href={`/dashboard/projets/${p.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', textDecoration: 'none' }} className="edit-btn" title="Modifier">
                                <Pencil size={12} />
                              </Link>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : p.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isDeletePending && (
                          <tr>
                            <td colSpan={6} style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', borderBottom: i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
                                <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Supprimer <strong>{p.name}</strong> et toutes ses données (leads, visites) ? Irréversible.</p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(p.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun projet trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .new-btn:hover    { background-color: #b8943d !important; }
        .client-row:hover { background-color: var(--dash-hover) !important; }
        .action-btn:hover { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .edit-btn:hover   { background-color: var(--dash-gold-muted) !important; }
        .del-btn:hover    { background-color: var(--dash-error-bg) !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
      `}</style>
    </div>
  )
}
