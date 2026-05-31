/**
 * Leads — Dashboard Signature 3D IA
 * Version: 2.0 — Connecté au backend PostgreSQL
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Search, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { leadsApi, type LeadDto } from '@/lib/api'

const GOLD = '#d4af37'

const statusStyle = (s: string) => {
  if (s === 'Nouveau')   return { label: 'Nouveau',    bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' }
  if (s === 'Contacte')  return { label: 'Contacté',   bg: 'rgba(212,175,55,0.1)',  color: GOLD }
  if (s === 'Converti')  return { label: 'Converti',   bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' }
  return                        { label: 'Fermé',      bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
}

const thStyle = {
  textAlign: 'left' as const, padding: '12px 16px',
  fontSize: '11px', textTransform: 'uppercase' as const,
  letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
  fontWeight: 400, borderBottom: '1px solid rgba(255,255,255,0.05)',
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
    } catch (err: any) {
      setError(err.message)
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
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Leads</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              {loading ? '...' : `${leads.length} lead${leads.length > 1 ? 's' : ''}`}
              {nouveaux > 0 && <span style={{ color: '#60a5fa', marginLeft: '8px' }}>· {nouveaux} nouveau{nouveaux > 1 ? 'x' : ''}</span>}
            </p>
          </div>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Recherche */}
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input type="text" placeholder="Nom, email, projet..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          {/* Table */}
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Chargement...</div>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                <MessageSquare size={32} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 14px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '6px' }}>Aucun lead pour le moment</p>
                <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                  Les leads apparaîtront ici quand des visiteurs rempliront un formulaire depuis vos expériences.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Projet</th>
                    <th style={thStyle}>Bouton</th>
                    <th style={thStyle}>Message</th>
                    <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('createdAt')} className="sort-th">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Date
                        {sortBy === 'createdAt' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </div>
                    </th>
                    <th style={thStyle}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const st = statusStyle(lead.status)
                    return (
                      <tr key={lead.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }} className="lead-row">
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>{lead.name ?? 'Anonyme'}</p>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', textDecoration: 'none' }} className="contact-link">
                              <Mail size={10} /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', textDecoration: 'none', marginTop: '2px' }} className="contact-link">
                              <Phone size={10} /> {lead.phone}
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 2px' }}>{lead.clientName}</p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{lead.projectName}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(212,175,55,0.08)', color: GOLD }}>{lead.buttonLabel}</span>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lead.message ?? '—'}
                          </p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{new Date(lead.createdAt).toLocaleDateString('fr-CA')}</span>
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
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun lead trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .lead-row:hover { background-color: rgba(255,255,255,0.02) !important; }
        .sort-th:hover { color: ${GOLD} !important; }
        .contact-link:hover { color: ${GOLD} !important; }
      `}</style>
    </div>
  )
}
