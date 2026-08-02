'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, BarChart3, ExternalLink, QrCode, FileText, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { ProjectDto } from '@/lib/api'

const statusStyle = (s: string) => {
  if (s === 'Active' || s === 'actif')  return { bg: 'var(--dash-success-bg)',  color: 'var(--dash-success)' }
  if (s === 'Draft')                    return { bg: 'var(--dash-gold-muted)',   color: 'var(--dash-gold)' }
  return                                       { bg: 'var(--dash-border)',       color: 'var(--dash-text-subtle)' }
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
  borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

/* ── Tableau Projets (+ confirmation suppression inline) ── */
export default function ClientProjectsTable({
  projects, slug, deleteConfirm,
  onToggleDeleteConfirm, onDeleteProject, onLinkProject, onQrProject, onDocProject, onEditProject,
}: {
  projects: ProjectDto[]
  slug: string
  deleteConfirm: string | null
  onToggleDeleteConfirm: (id: string) => void
  onDeleteProject: (id: string) => void
  onLinkProject: (project: ProjectDto) => void
  onQrProject: (project: ProjectDto) => void
  onDocProject: (project: ProjectDto) => void
  onEditProject: (project: ProjectDto) => void
}) {
  return (
    <div>
      <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', marginBottom: '16px' }}>Projets — {projects.length}</h2>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '16px' }}>Aucun projet pour ce client</p>
          <Link href={`/dashboard/clients/${slug}/nouveau-projet`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }}>
            <Plus size={13} /> Créer le premier projet
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} className="dash-label">Projet</th>
                <th style={thStyle} className="dash-label">Statut</th>
                <th style={thStyle} className="dash-label">Date</th>
                <th style={thStyle} className="dash-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => {
                const st = statusStyle(project.status)
                return (
                  <React.Fragment key={project.id}>
                    <tr style={{ borderBottom: deleteConfirm === project.id ? 'none' : (i < projects.length - 1 ? '1px solid var(--dash-border)' : 'none') }} className="proj-row">
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>{project.name}</p>
                        <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: '2px 0 0' }}>{project.matterportId || 'IA seule'}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: st.bg, color: st.color }}>{project.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{new Date(project.createdAt).toLocaleDateString('fr-CA')}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <Link href={`/dashboard/clients/${slug}/projets/${project.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="action-btn"><BarChart3 size={11} /> Voir</Link>
                          <button onClick={() => onLinkProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><ExternalLink size={11} /> Lien</button>
                          <button onClick={() => onQrProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><QrCode size={11} /> QR</button>
                          <button onClick={() => onDocProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="action-btn"><FileText size={11} /> PDF</button>
                          <button onClick={() => onEditProject(project)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn"><Pencil size={11} /> Modifier</button>
                          <button onClick={() => onToggleDeleteConfirm(project.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="delete-btn"><Trash2 size={11} /> Supprimer</button>
                        </div>
                      </td>
                    </tr>
                    {deleteConfirm === project.id && (
                      <tr>
                        <td colSpan={4} style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', borderBottom: i < projects.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <AlertTriangle size={14} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
                            <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>Supprimer <strong>{project.name}</strong> ? Cette action est irréversible.</p>
                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                              <button onClick={() => onToggleDeleteConfirm(project.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                              <button onClick={() => onDeleteProject(project.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
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
  )
}
