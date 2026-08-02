/**
 * Leads — Dashboard Signature 3D IA
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Search, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { leadsApi, type LeadDto } from '@/lib/api'

const statusStyle = (s: string) => {
  if (s === 'Nouveau')   return { label: 'Nouveau',  bg: 'rgba(59,130,246,0.1)',  color: 'var(--dash-info)' }
  if (s === 'Contacte')  return { label: 'Contacté', bg: 'var(--dash-gold-muted)', color: 'var(--dash-gold)' }
  if (s === 'Converti')  return { label: 'Converti', bg: 'var(--dash-success-bg)', color: 'var(--dash-success)' }
  return                        { label: 'Fermé',    bg: 'var(--dash-border)',     color: 'var(--dash-text-muted)' }
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
  borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

export default function LeadsPage() {
  const [leads, setLeads]         = useState<LeadDto[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState<'createdAt' | 'clientName'>('createdAt')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc')
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    leadsApi.getAll(1, 100)
      .then((result) => setLeads(result.items as LeadDto[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleSort = (col: 'createdAt' | 'clientName') => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await leadsApi.updateStatus(id, status)
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const filtered = leads
    .filter((l) =>
      (l.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.projectName.toLowerCase().includes(search.toLowerCase()) ||
      l.clientName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortDir === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return sortDir === 'asc'
        ? a.clientName.localeCompare(b.clientName)
        : b.clientName.localeCompare(a.clientName)
    })

  const nouveaux = leads.filter((l) => l.status === 'Nouveau').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Leads</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
              {loading ? '...' : `${leads.length} lead${leads.length > 1 ? 's' : ''}`}
              {nouveaux > 0 && <span style={{ color: 'var(--dash-info)', marginLeft: '8px' }}>· {nouveaux} nouveau{nouveaux > 1 ? 'x' : ''}</span>}
            </p>
          </div>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Recherche */}
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
            <input type="text" placeholder="Nom, email, projet..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '8px', paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px', fontSize: '13px', color: 'var(--dash-text)', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          {/* Table */}
          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                <MessageSquare size={32} style={{ color: 'var(--dash-border-input)', margin: '0 auto 14px' }} />
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', marginBottom: '6px' }}>Aucun lead pour le moment</p>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                  Les leads apparaîtront ici quand des visiteurs rempliront un formulaire depuis vos expériences.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle} className="dash-label">Contact</th>
                    <th style={thStyle} className="dash-label">Projet</th>
                    <th style={thStyle} className="dash-label">Bouton</th>
                    <th style={thStyle} className="dash-label">Message</th>
                    <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('createdAt')} className="dash-label sort-th">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Date
                        {sortBy === 'createdAt' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </div>
                    </th>
                    <th style={thStyle} className="dash-label">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const st = statusStyle(lead.status)
                    return (
                      <tr key={lead.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none' }} className="lead-row">
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>{lead.name ?? 'Anonyme'}</p>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--dash-text-muted)', fontSize: '11px', textDecoration: 'none' }} className="contact-link">
                              <Mail size={10} /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--dash-text-muted)', fontSize: '11px', textDecoration: 'none', marginTop: '2px' }} className="contact-link">
                              <Phone size={10} /> {lead.phone}
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: '0 0 2px' }}>{lead.clientName}</p>
                          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0 }}>{lead.projectName}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'var(--dash-gold-muted)', color: 'var(--dash-gold)' }}>{lead.buttonLabel}</span>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                          <p style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lead.message ?? '—'}
                          </p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{new Date(lead.createdAt).toLocaleDateString('fr-CA')}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: st.bg, color: st.color, border: `1px solid ${st.color}40`, outline: 'none', cursor: 'pointer' }}
                          >
                            <option value="Nouveau">Nouveau</option>
                            <option value="Contacte">Contacté</option>
                            <option value="Converti">Converti</option>
                            <option value="Ferme">Fermé</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun lead trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .lead-row:hover { background-color: var(--dash-hover) !important; }
        .sort-th:hover { color: var(--dash-gold) !important; }
        .contact-link:hover { color: var(--dash-gold) !important; }
      `}</style>
    </div>
  )
}
