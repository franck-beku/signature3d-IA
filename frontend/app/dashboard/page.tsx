/**
 * Dashboard — Vue globale
 * Signature 3D IA
 * Version: 3.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Bell, Plus, Users, FolderOpen, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { clientsApi, type ClientDto } from '@/lib/api'

export default function DashboardPage() {
  const [userName, setUserName]   = useState('...')
  const [clients, setClients]     = useState<ClientDto[]>([])
  const [loading, setLoading]     = useState(true)
  const [totalProjets, setTotalProjets] = useState(0)

  useEffect(() => {
    /* Nom depuis localStorage */
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUserName(parsed.name?.split(' ')[0] ?? '...')
    }

    /* Charger les clients depuis le backend */
    clientsApi.getAll(1, 100)
      .then((result) => {
        const items = result.items as ClientDto[]
        setClients(items)
        setTotalProjets(items.reduce((sum, c) => sum + c.projectCount, 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const actifs = clients.filter((c) => c.status === 'Actif').length

  const kpis = [
    { icon: Users,      value: loading ? '...' : String(clients.length), label: 'Clients',     sub: `${actifs} actifs`        },
    { icon: FolderOpen, value: loading ? '...' : String(totalProjets),   label: 'Expériences', sub: 'Matterport live'         },
    { icon: TrendingUp, value: '—', label: 'Leads reçus',  sub: 'Connecté au backend'    },
    { icon: Clock,      value: '—', label: 'Visiteurs',    sub: 'Connecté au backend'    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--dash-text)', margin: 0 }}>
              Bonjour, <span style={{ color: 'var(--dash-gold)' }}>{userName}</span>
            </h1>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              Vue globale
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard/notifications" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="notif-btn">
              <Bell size={15} />
            </Link>
            <Link href="/dashboard/clients/nouveau-client" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }} className="new-btn">
              <Plus size={13} /> Nouveau client
            </Link>
          </div>
        </div>

        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="kpi-grid">
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={15} style={{ color: 'var(--dash-gold)' }} />
                  </div>
                  <span style={{ color: 'var(--dash-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{kpi.label}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: kpi.value === '—' || kpi.value === '...' ? 'var(--dash-text-muted)' : 'var(--dash-text)', margin: 0, lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '6px' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="dash-grid">

            {/* Clients depuis PostgreSQL */}
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>Clients</h2>
                <Link href="/dashboard/clients" style={{ color: 'var(--dash-gold)', fontSize: '12px', textDecoration: 'none' }}>Voir tous →</Link>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                  Chargement...
                </div>
              ) : clients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                  Aucun client — <Link href="/dashboard/clients/nouveau-client" style={{ color: 'var(--dash-gold)', textDecoration: 'none' }}>créer le premier</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {clients.slice(0, 5).map((c, i) => (
                    <Link key={c.id} href={`/dashboard/clients/${c.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < Math.min(clients.length, 5) - 1 ? '1px solid var(--dash-border)' : 'none', textDecoration: 'none' }} className="client-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'var(--dash-gold)', fontSize: '12px', fontWeight: 500 }}>{c.name[0]}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', margin: 0 }}>{c.sectorName} · {c.projectCount} expérience{c.projectCount > 1 ? 's' : ''}</p>
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: c.status === 'Actif' ? 'var(--dash-success-bg)' : 'var(--dash-gold-muted)', color: c.status === 'Actif' ? 'var(--dash-success)' : 'var(--dash-gold)' }}>
                        {c.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>Notifications récentes</h2>
                <Link href="/dashboard/notifications" style={{ color: 'var(--dash-gold)', fontSize: '12px', textDecoration: 'none' }}>Voir toutes →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Bell size={20} style={{ color: 'var(--dash-gold-icon)' }} />
                </div>
                <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Aucune notification</p>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', lineHeight: 1.6, maxWidth: '220px' }}>
                  Les notifications apparaîtront ici en temps réel dès que quelqu&apos;un visitera vos expériences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .notif-btn:hover { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .new-btn:hover { background-color: #b8943d !important; }
        .client-row:hover { opacity: 0.75; }
        @media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 900px)  { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
