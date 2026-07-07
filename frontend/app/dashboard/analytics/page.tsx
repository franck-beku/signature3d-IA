/**
 * Analytics — Dashboard Signature 3D IA
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { BarChart2, Users, TrendingUp, MessageSquare, Clock } from 'lucide-react'
import { clientsApi, projectsApi, analyticsApi, type ClientDto, type ProjectDto } from '@/lib/api'

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const cardStyle = { backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px' }

interface AnalyticsData {
  totalVisitors: number
  totalLeads: number
  totalInteractions: number
  avgDurationSeconds: number
  visitorsByMonth: number[]
  leadsByMonth: number[]
  topQuestions: { question: string; count: number }[]
}

export default function AnalyticsPage() {
  const [clients, setClients]           = useState<ClientDto[]>([])
  const [projects, setProjects]         = useState<ProjectDto[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading]           = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  /* Charger les clients */
  useEffect(() => {
    clientsApi.getAll(1, 100)
      .then((result) => {
        const items = result.items as ClientDto[]
        setClients(items)
        if (items.length > 0) setSelectedClient(items[0].id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des clients.'))
      .finally(() => setLoading(false))
  }, [])

  /* Charger les projets du client sélectionné */
  useEffect(() => {
    if (!selectedClient) return
    projectsApi.getByClient(selectedClient)
      .then((projs) => {
        const items = projs as ProjectDto[]
        setProjects(items)
        if (items.length > 0) setSelectedProject(items[0].id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets.'))
  }, [selectedClient])

  /* Charger les analytics du projet sélectionné */
  useEffect(() => {
    if (!selectedProject) return
    setLoadingAnalytics(true)
    analyticsApi.getByProject(selectedProject)
      .then((data) => setAnalytics(data as AnalyticsData))
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false))
  }, [selectedProject])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const selectedProjectData = projects.find((p) => p.id === selectedProject)

  const maxVisitors = analytics ? Math.max(...analytics.visitorsByMonth, 1) : 1
  const maxLeads    = analytics ? Math.max(...analytics.leadsByMonth, 1) : 1

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Analytics</h1>
            <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">Statistiques par projet</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
              style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--dash-text)', outline: 'none' }}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--dash-text)', outline: 'none' }}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>Chargement...</div>
          ) : clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 32px' }}>
              <BarChart2 size={32} style={{ color: 'var(--dash-border-input)', margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun client — créez un client pour voir les analytics</p>
            </div>
          ) : !analytics || loadingAnalytics ? (
            <div style={{ textAlign: 'center', padding: '80px 32px' }}>
              <BarChart2 size={32} style={{ color: 'var(--dash-border-input)', margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                {loadingAnalytics ? 'Chargement...' : 'Aucune donnée pour ce projet'}
              </p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', maxWidth: '360px', margin: '8px auto 0', lineHeight: 1.6 }}>
                Les statistiques apparaîtront dès que des visiteurs accèderont à l&apos;expérience.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="kpi-grid">
                {[
                  { icon: Users,         label: 'Visiteurs',       value: analytics.totalVisitors,    color: 'var(--dash-text)' },
                  { icon: TrendingUp,    label: 'Leads générés',   value: analytics.totalLeads,       color: 'var(--dash-gold)' },
                  { icon: MessageSquare, label: 'Interactions IA', value: analytics.totalInteractions, color: 'var(--dash-success)' },
                  { icon: Clock,         label: 'Durée moyenne',   value: formatDuration(analytics.avgDurationSeconds), color: 'var(--dash-info)' },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ ...cardStyle, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: kpi.color, marginBottom: '6px', lineHeight: 1 }}>{kpi.value}</div>
                    <div className="dash-micro-label">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Graphique visiteurs */}
              <div style={{ ...cardStyle, padding: '24px' }}>
                <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Visiteurs par mois — {selectedProjectData?.name}</h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                  {analytics.visitorsByMonth.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      {v > 0 && <span style={{ color: 'var(--dash-text-muted)', fontSize: '10px' }}>{v}</span>}
                      <div style={{ width: '100%', backgroundColor: 'var(--dash-gold-bar)', borderRadius: '4px 4px 0 0', height: `${(v / maxVisitors) * 100}%`, minHeight: v > 0 ? '4px' : '2px' }} className="bar-visitors" />
                      <span style={{ color: 'var(--dash-text-muted)', fontSize: '9px' }}>{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="charts-grid">
                {/* Leads par mois */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Leads par mois</h2>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
                    {analytics.leadsByMonth.map((l, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', backgroundColor: 'var(--dash-success-bar)', borderRadius: '4px 4px 0 0', height: `${(l / maxLeads) * 100}%`, minHeight: l > 0 ? '4px' : '2px' }} className="bar-leads" />
                        <span style={{ color: 'var(--dash-text-muted)', fontSize: '9px' }}>{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions fréquentes */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Questions fréquentes</h2>
                  {analytics.topQuestions.length === 0 ? (
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucune question enregistrée</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.topQuestions.slice(0, 5).map((q, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--dash-gold-icon)', fontSize: '11px', width: '16px', flexShrink: 0 }}>{i + 1}</span>
                          <div style={{ flex: 1, backgroundColor: 'var(--dash-input)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--dash-gold-icon)', borderRadius: '999px', width: `${(q.count / analytics.topQuestions[0].count) * 100}%` }} />
                          </div>
                          <span style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', width: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style>{`
        .bar-visitors:hover { background-color: rgba(200,164,93,0.5) !important; }
        .bar-leads:hover { background-color: rgba(74,222,128,0.5) !important; }
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } .charts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
