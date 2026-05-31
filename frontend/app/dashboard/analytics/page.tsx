/**
 * Analytics — Dashboard Signature 3D IA
 * Version: 2.0 — Connecté au backend PostgreSQL
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { BarChart2, Users, TrendingUp, MessageSquare, Clock } from 'lucide-react'
import { clientsApi, projectsApi, analyticsApi, type ClientDto, type ProjectDto } from '@/lib/api'

const GOLD = '#d4af37'
const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const cardStyle = { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }

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

  /* Charger les clients */
  useEffect(() => {
    clientsApi.getAll(1, 100)
      .then((result) => {
        const items = result.items as ClientDto[]
        setClients(items)
        if (items.length > 0) setSelectedClient(items[0].id)
      })
      .catch(console.error)
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
      .catch(console.error)
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
  const selectedClientData  = clients.find((c) => c.id === selectedClient)

  const maxVisitors = analytics ? Math.max(...analytics.visitorsByMonth, 1) : 1
  const maxLeads    = analytics ? Math.max(...analytics.leadsByMonth, 1) : 1

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'white', margin: 0 }}>Analytics</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>Statistiques par projet</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
              style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', color: 'white', outline: 'none' }}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', color: 'white', outline: 'none' }}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Chargement...</div>
          ) : clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 32px' }}>
              <BarChart2 size={32} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 14px' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Aucun client — créez un client pour voir les analytics</p>
            </div>
          ) : !analytics || loadingAnalytics ? (
            <div style={{ textAlign: 'center', padding: '80px 32px' }}>
              <BarChart2 size={32} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 14px' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                {loadingAnalytics ? 'Chargement...' : 'Aucune donnée pour ce projet'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px', maxWidth: '360px', margin: '8px auto 0', lineHeight: 1.6 }}>
                Les statistiques apparaîtront dès que des visiteurs accèderont à l&apos;expérience.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="kpi-grid">
                {[
                  { icon: Users,         label: 'Visiteurs',       value: analytics.totalVisitors,    color: 'white' },
                  { icon: TrendingUp,    label: 'Leads générés',   value: analytics.totalLeads,       color: GOLD },
                  { icon: MessageSquare, label: 'Interactions IA', value: analytics.totalInteractions, color: '#4ade80' },
                  { icon: Clock,         label: 'Durée moyenne',   value: formatDuration(analytics.avgDurationSeconds), color: '#60a5fa' },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ ...cardStyle, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: kpi.color, marginBottom: '6px', lineHeight: 1 }}>{kpi.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Graphique visiteurs */}
              <div style={{ ...cardStyle, padding: '24px' }}>
                <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Visiteurs par mois — {selectedProjectData?.name}</h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                  {analytics.visitorsByMonth.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      {v > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{v}</span>}
                      <div style={{ width: '100%', backgroundColor: 'rgba(212,175,55,0.2)', borderRadius: '4px 4px 0 0', height: `${(v / maxVisitors) * 100}%`, minHeight: v > 0 ? '4px' : '2px' }} className="bar-visitors" />
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px' }}>{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="charts-grid">
                {/* Leads par mois */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Leads par mois</h2>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
                    {analytics.leadsByMonth.map((l, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: '4px 4px 0 0', height: `${(l / maxLeads) * 100}%`, minHeight: l > 0 ? '4px' : '2px' }} className="bar-leads" />
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px' }}>{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions fréquentes */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>Questions fréquentes</h2>
                  {analytics.topQuestions.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucune question enregistrée</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.topQuestions.slice(0, 5).map((q, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '11px', width: '16px', flexShrink: 0 }}>{i + 1}</span>
                          <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'rgba(212,175,55,0.6)', borderRadius: '999px', width: `${(q.count / analytics.topQuestions[0].count) * 100}%` }} />
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', width: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</span>
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
        .bar-visitors:hover { background-color: rgba(212,175,55,0.5) !important; }
        .bar-leads:hover { background-color: rgba(74,222,128,0.5) !important; }
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } .charts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
