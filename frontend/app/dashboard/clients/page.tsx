/**
 * Clients — Dashboard
 * Version: 4.1 — Thème clair (variables --dash-*)
 */

'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Plus, Search, ChevronUp, ChevronDown, ChevronRight, Trash2, Pencil, AlertTriangle, X, Check } from 'lucide-react'
import Link from 'next/link'
import { clientsApi, sectorsApi, type ClientDto, type SectorDto } from '@/lib/api'
import { getPriority } from '@/lib/priority'

const statusLabel = (s: string) => {
  if (s === 'Actif')     return { label: 'Actif',      bg: 'var(--dash-success-bg)',   color: 'var(--dash-success)' }
  if (s === 'EnCours')   return { label: 'En cours',   bg: 'var(--dash-gold-muted)',   color: 'var(--dash-gold)' }
  if (s === 'Prospect')  return { label: 'Prospect',   bg: 'rgba(59,130,246,0.1)',     color: 'var(--dash-info)' }
  return                        { label: 'En attente', bg: 'var(--dash-border)',        color: 'var(--dash-text-subtle)' }
}

const thStyle = {
  textAlign: 'left' as const, padding: '14px 16px',
  fontSize: '11px', textTransform: 'uppercase' as const,
  letterSpacing: '0.15em', color: 'var(--dash-text-muted)',
  fontWeight: 400, borderBottom: '1px solid var(--dash-border)',
  whiteSpace: 'nowrap' as const,
}

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

interface EditForm {
  id: string; name: string; email: string; phone: string
  contractDate: string; status: string; priority: number; sectorId: string
}

export default function ClientsPage() {
  const [clients, setClients]             = useState<ClientDto[]>([])
  const [sectors, setSectors]             = useState<SectorDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [sortBy, setSortBy]               = useState<'contractDate' | 'priority'>('contractDate')
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('asc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editClient, setEditClient]       = useState<EditForm | null>(null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      clientsApi.getAll(1, 100),
      sectorsApi.getAll(),
    ])
      .then(([clientsResult, sectorsResult]) => {
        setClients(clientsResult.items as ClientDto[])
        setSectors(sectorsResult as SectorDto[])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleSort = (col: 'contractDate' | 'priority') => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const handleDelete = async (id: string) => {
    try {
      await clientsApi.delete(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const openEdit = (c: ClientDto) => {
    setEditClient({
      id:           c.id,
      name:         c.name,
      email:        c.email,
      phone:        c.phone ?? '',
      contractDate: c.contractDate.split('T')[0],
      status:       c.status,
      priority:     c.priority,
      sectorId:     c.sectorId,
    })
  }

  const handleSaveEdit = async () => {
    if (!editClient) return
    setSaving(true)
    try {
      const sector = sectors.find((s) => s.name === editClient.sectorId || s.id === editClient.sectorId)
      const updated = await clientsApi.update(editClient.id, {
        name:         editClient.name,
        email:        editClient.email,
        phone:        editClient.phone,
        contractDate: editClient.contractDate,
        deliveryDate: editClient.contractDate,
        status:       editClient.status,
        priority:     editClient.priority,
        sectorId:     sector?.id ?? editClient.sectorId,
      })
      setClients((prev) => prev.map((c) => c.id === editClient.id ? updated as ClientDto : c))
      setEditClient(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.sectorName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'contractDate') {
        return sortDir === 'asc'
          ? new Date(a.contractDate).getTime() - new Date(b.contractDate).getTime()
          : new Date(b.contractDate).getTime() - new Date(a.contractDate).getTime()
      }
      return sortDir === 'asc' ? a.priority - b.priority : b.priority - a.priority
    })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--dash-text)', margin: 0 }}>Clients</h1>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              {loading ? '...' : `${clients.length} client${clients.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/dashboard/clients/nouveau-client" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
            <Plus size={13} /> Nouveau client
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
            <input type="text" placeholder="Nom, email, secteur..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} />
          </div>

          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Secteur</th>
                    <th style={thStyle}>Email</th>
                    <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('contractDate')} className="sort-th">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Date contrat
                        {sortBy === 'contractDate' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </div>
                    </th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('priority')} className="sort-th">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Priorité
                        {sortBy === 'priority' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </div>
                    </th>
                    <th style={thStyle}>Projets</th>
                    <th style={{ ...thStyle, textAlign: 'center' as const }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const priority = getPriority(c.priority)
                    const status   = statusLabel(c.status)
                    const isDeletePending = deleteConfirm === c.id
                    return (
                      <React.Fragment key={c.id}>
                        <tr style={{ borderBottom: isDeletePending ? 'none' : (i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none'), transition: 'background 0.2s ease' }} className="client-row">
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: 'var(--dash-gold)', fontSize: '12px', fontWeight: 500 }}>{c.name[0]}</span>
                              </div>
                              <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{c.name}</p>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{c.sectorName}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text-subtle)', fontSize: '13px' }}>{c.email}</span></td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text)', fontSize: '13px' }}>{new Date(c.contractDate).toLocaleDateString('fr-CA')}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: status.bg, color: status.color }}>{status.label}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: priority.bgColor, color: priority.color }}>{priority.label}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--dash-text)', fontSize: '13px' }}>{c.projectCount}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <Link href={`/dashboard/clients/${c.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="action-btn" title="Voir">
                                <ChevronRight size={13} />
                              </Link>
                              <button onClick={() => openEdit(c)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn" title="Modifier">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => setDeleteConfirm(isDeletePending ? null : c.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="del-btn" title="Supprimer">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isDeletePending && (
                          <tr>
                            <td colSpan={8} style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', borderBottom: i < filtered.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={14} style={{ color: 'var(--dash-error)', flexShrink: 0 }} />
                                <p style={{ color: 'var(--dash-error)', fontSize: '13px', margin: 0 }}>
                                  Supprimer <strong>{c.name}</strong> et tous ses projets ? Cette action est irréversible.
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                                  <button onClick={() => handleDelete(c.id)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun client trouvé</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal Modifier */}
      {editClient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>Modifier le client</h2>
              <button onClick={() => setEditClient(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn">
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Nom</label>
                  <input type="text" value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Secteur</label>
                  <select value={editClient.sectorId} onChange={(e) => setEditClient({ ...editClient, sectorId: e.target.value })} style={inputStyle} className="dash-input">
                    <option value="">Choisir un secteur</option>
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Email</label>
                  <input type="email" value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Téléphone</label>
                  <input type="tel" value={editClient.phone} onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })} style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Date contrat</label>
                  <input type="date" value={editClient.contractDate} onChange={(e) => setEditClient({ ...editClient, contractDate: e.target.value })} style={inputStyle} className="dash-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Statut</label>
                  <select value={editClient.status} onChange={(e) => setEditClient({ ...editClient, status: e.target.value })} style={inputStyle} className="dash-input">
                    <option value="Prospect">Prospect</option>
                    <option value="EnAttente">En attente</option>
                    <option value="EnCours">En cours</option>
                    <option value="Actif">Actif</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Priorité</label>
                  <select value={editClient.priority} onChange={(e) => setEditClient({ ...editClient, priority: Number(e.target.value) })} style={inputStyle} className="dash-input">
                    <option value={1}>Haute</option>
                    <option value={2}>Moyenne</option>
                    <option value={3}>Normale</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={handleSaveEdit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }} className="save-btn">
                  <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => setEditClient(null)} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .new-btn:hover    { background-color: #b8943d !important; }
        .client-row:hover { background-color: var(--dash-hover) !important; }
        .sort-th:hover    { color: var(--dash-gold) !important; }
        .action-btn:hover { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .edit-btn:hover   { background-color: var(--dash-gold-muted) !important; }
        .del-btn:hover    { background-color: var(--dash-error-bg) !important; }
        .close-btn:hover  { color: var(--dash-text) !important; }
        .save-btn:hover   { background-color: #b8943d !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
      `}</style>
    </div>
  )
}
