/**
 * Projets — Dashboard Signature Immersion
 * Liste des projets (réelle) + accès création/édition.
 */

'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, ExternalLink, Trash2, Pencil, AlertTriangle, Star } from 'lucide-react'
import Link from 'next/link'
import { projectsApi, type ProjectDto } from '@/lib/api'

const GOLD = '#d4af37'

const thStyle = {
  textAlign: 'left' as const, padding: '14px 16px',
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
    } catch (err: any) {
      setError(err.message)
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
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Projets</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              {loading ? '...' : `${projects.length} projet${projects.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/dashboard/projets/nouveau" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
            <Plus size={13} /> Nouveau projet
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>{error}</div>
          )}

          {/* Recherche + filtres */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '320px' }}>
              <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" placeholder="Projet, client, secteur..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} className="dash-input" />
            </div>
            {([['tous', 'Tous'], ['publies', 'Publiés'], ['brouillons', 'Brouillons']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  fontSize: '12px', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: filter === key ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: filter === key ? GOLD : 'transparent',
                  color: filter === key ? '#000' : 'rgba(255,255,255,0.4)',
                  fontWeight: filter === key ? 600 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Projet</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Secteur</th>
                    <th style={thStyle}>Offre</th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const isDeletePending = deleteConfirm === p.id
                    return (
                      <React.Fragment key={p.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none') }} className="client-row">
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: GOLD, fontSize: '12px', fontWeight: 500 }}>{p.name[0]}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{p.name}</p>
                                {p.isFeatured && <Star size={12} style={{ color: GOLD, fill: GOLD }} />}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{p.clientName}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{p.sectorName ?? '—'}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{p.offeringName ?? '—'}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            {p.isPublished
                              ? <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>Publié</span>
                              : <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(212,175,55,0.1)', color: GOLD }}>Brouillon</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <a href={p.embedUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="action-btn" title="Voir l'expérience">
                                <ExternalLink size={12} />
                              </a>
                              <Link href={`/dashboard/projets/${p.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: `1px solid rgba(212,175,55,0.2)`, color: GOLD, textDecoration: 'none' }} className="edit-btn" title="Modifier">
                                <Pencil size={12} />
                              </Link>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : p.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isDeletePending && (
                          <tr>
                            <td colSpan={6} style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.05)', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>Supprimer <strong>{p.name}</strong> et toutes ses données (leads, visites) ? Irréversible.</p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(p.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#f87171', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun projet trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .new-btn:hover    { background-color: #c9a84c !important; }
        .client-row:hover { background-color: rgba(255,255,255,0.02) !important; }
        .action-btn:hover { color: ${GOLD} !important; border-color: rgba(212,175,55,0.3) !important; }
        .edit-btn:hover   { background-color: rgba(212,175,55,0.1) !important; }
        .del-btn:hover    { background-color: rgba(248,113,113,0.1) !important; }
        .dash-input:focus { border-color: ${GOLD} !important; }
      `}</style>
    </div>
  )
}