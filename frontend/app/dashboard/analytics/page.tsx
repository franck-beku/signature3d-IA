/**
 * Analytics — Dashboard Signature 3D IA
 * Version: 3.0 — Données réelles (dailyStats) + sélecteur de période + graphique SVG
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { BarChart2, Users, TrendingUp, MessageSquare, QrCode, Clock, HelpCircle } from 'lucide-react'
import { clientsApi, projectsApi, analyticsApi, type ClientDto, type ProjectDto, type ProjectAnalyticsDto } from '@/lib/api'

const cardStyle = { backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px' }

type Period = '30d' | '3m' | 'all'

const PERIODS: { key: Period; label: string }[] = [
  { key: '30d', label: '30 derniers jours' },
  { key: '3m', label: '3 derniers mois' },
  { key: 'all', label: 'Depuis le début' },
]

/** Calcule from/to pour une période. 'all' n'envoie que `to` — le backend
 *  utilise alors la date de création du projet comme borne de départ. */
function rangeFor(period: Period): { from?: Date; to: Date } {
  const to = new Date()
  if (period === '30d') return { from: new Date(to.getTime() - 30 * 86400_000), to }
  if (period === '3m') return { from: new Date(to.getTime() - 90 * 86400_000), to }
  return { to }
}

export default function AnalyticsPage() {
  const [clients, setClients]           = useState<ClientDto[]>([])
  const [projects, setProjects]         = useState<ProjectDto[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [period, setPeriod]             = useState<Period>('30d')
  const [analytics, setAnalytics]       = useState<ProjectAnalyticsDto | null>(null)
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

  /* Charger les analytics du projet sélectionné pour la période choisie */
  useEffect(() => {
    if (!selectedProject) return
    setLoadingAnalytics(true)
    const { from, to } = rangeFor(period)
    analyticsApi.getByProject(selectedProject, from, to)
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false))
  }, [selectedProject, period])

  const formatDuration = (seconds: number) => {
    const total = Math.round(seconds)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const selectedProjectData = projects.find((p) => p.id === selectedProject)
  const hasActivity = !!analytics && (analytics.totalVisits > 0 || analytics.totalLeads > 0 || analytics.dailyStats.length > 0)

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
          ) : (
            <>
              {/* Sélecteur de période */}
              <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: 'var(--dash-input)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '7px',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: period === p.key ? 'var(--dash-surface)' : 'transparent',
                      color: period === p.key ? 'var(--dash-text)' : 'var(--dash-text-muted)',
                      boxShadow: period === p.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {!analytics || loadingAnalytics ? (
                <div style={{ textAlign: 'center', padding: '80px 32px' }}>
                  <BarChart2 size={32} style={{ color: 'var(--dash-border-input)', margin: '0 auto 14px' }} />
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                    {loadingAnalytics ? 'Chargement...' : 'Aucune donnée pour ce projet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }} className="kpi-grid">
                    {[
                      { icon: Users,         label: 'Visites',         value: analytics.totalVisits,       color: 'var(--dash-text)' },
                      { icon: TrendingUp,    label: 'Leads générés',   value: analytics.totalLeads,        color: 'var(--dash-gold)' },
                      { icon: MessageSquare, label: 'Messages IA',     value: analytics.totalChatMessages, color: 'var(--dash-success)' },
                      { icon: QrCode,        label: 'Scans QR',        value: analytics.totalQrScans,      color: 'var(--dash-info)' },
                      { icon: Clock,         label: 'Durée moyenne',   value: formatDuration(analytics.avgDurationSeconds), color: 'var(--dash-info)' },
                    ].map((kpi) => (
                      <div key={kpi.label} style={{ ...cardStyle, padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 300, color: kpi.color, marginBottom: '6px', lineHeight: 1 }}>{kpi.value}</div>
                        <div className="dash-micro-label">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Graphique visites / leads */}
                  <div style={{ ...cardStyle, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                      <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>
                        Visites &amp; leads — {selectedProjectData?.name}
                      </h2>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--dash-gold)', display: 'inline-block' }} /> Visites
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--dash-success)', display: 'inline-block' }} /> Leads
                        </span>
                      </div>
                    </div>
                    {analytics.dailyStats.length === 0 ? (
                      <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Aucune activité sur cette période</p>
                    ) : (
                      <DailyStatsChart data={analytics.dailyStats} formatDate={formatDate} />
                    )}
                  </div>

                  {/* Questions fréquentes */}
                  <div style={{ ...cardStyle, padding: '24px' }}>
                    <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>Questions fréquentes</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 0 8px' }}>
                      <HelpCircle size={24} style={{ color: 'var(--dash-border-input)' }} />
                      <p style={{ color: 'var(--dash-text-muted)', fontSize: '12.5px', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6, margin: 0 }}>
                        Aucune question suivie pour l&apos;instant — cette fonctionnalité sera alimentée automatiquement.
                      </p>
                    </div>
                  </div>

                  {!hasActivity && (
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', textAlign: 'center', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
                      Les statistiques apparaîtront dès que des visiteurs accèderont à l&apos;expérience.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <style>{`
        @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}

/* ══════════════════════════════════════
   Graphique SVG — courbes visites / leads
   ══════════════════════════════════════ */

function DailyStatsChart({
  data,
  formatDate,
}: {
  data: { date: string; visits: number; leads: number }[]
  formatDate: (iso: string) => string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 760
  const height = 220
  const padding = { top: 10, right: 10, bottom: 26, left: 34 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const maxValue = useMemo(
    () => Math.max(1, ...data.map((d) => Math.max(d.visits, d.leads))),
    [data]
  )

  // Position en X par date réelle (pas par index) : deux visites espacées de
  // 2 semaines ne doivent pas paraître aussi proches que deux visites la veille.
  const timestamps = useMemo(() => data.map((d) => new Date(d.date).getTime()), [data])
  const minTime = timestamps[0]
  const maxTime = timestamps[timestamps.length - 1]
  const timeSpan = Math.max(1, maxTime - minTime)

  const x = (i: number) =>
    padding.left + (data.length === 1 ? innerW / 2 : ((timestamps[i] - minTime) / timeSpan) * innerW)
  const y = (v: number) => padding.top + innerH - (v / maxValue) * innerH

  const linePath = (key: 'visits' | 'leads') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ')

  const areaPath = (key: 'visits' | 'leads') =>
    `${linePath(key)} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`

  // n'affiche qu'une poignée de labels de dates pour éviter le chevauchement
  const labelStep = Math.max(1, Math.ceil(data.length / 7))

  // repères de l'axe Y : 0 / mi-hauteur / max
  const yTicks = [0, 0.5, 1].map((f) => ({ f, value: Math.round(maxValue * f) }))

  // zones de survol à largeur variable, bornées aux milieux entre points voisins
  // (nécessaire car les points ne sont plus espacés uniformément)
  const hoverZones = data.map((_, i) => {
    const left = i === 0 ? padding.left : (x(i - 1) + x(i)) / 2
    const right = i === data.length - 1 ? width - padding.right : (x(i) + x(i + 1)) / 2
    return { left, width: right - left }
  })

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dash-gold)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--dash-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grille horizontale + labels Y */}
        {yTicks.map(({ f, value }) => (
          <g key={f}>
            <line
              x1={padding.left} x2={width - padding.right}
              y1={padding.top + innerH * (1 - f)} y2={padding.top + innerH * (1 - f)}
              stroke="var(--dash-border)" strokeWidth={1}
            />
            <text
              x={padding.left - 8} y={padding.top + innerH * (1 - f)}
              fontSize="9" fill="var(--dash-text-muted)" textAnchor="end" dominantBaseline="middle"
            >
              {value}
            </text>
          </g>
        ))}

        {/* zone sous la courbe des visites */}
        <path d={areaPath('visits')} fill="url(#visitsGradient)" />

        {/* courbes */}
        <path d={linePath('visits')} fill="none" stroke="var(--dash-gold)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath('leads')} fill="none" stroke="var(--dash-success)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* points + zone de survol */}
        {data.map((d, i) => (
          <g key={d.date}>
            <rect
              x={hoverZones[i].left} y={padding.top}
              width={hoverZones[i].width} height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
            />
            {hoverIndex === i && (
              <line x1={x(i)} x2={x(i)} y1={padding.top} y2={padding.top + innerH} stroke="var(--dash-border-input)" strokeWidth={1} strokeDasharray="3 3" />
            )}
            <circle cx={x(i)} cy={y(d.visits)} r={hoverIndex === i ? 4 : 2.5} fill="var(--dash-gold)" />
            <circle cx={x(i)} cy={y(d.leads)} r={hoverIndex === i ? 4 : 2.5} fill="var(--dash-success)" />
            {i % labelStep === 0 && (
              <text x={x(i)} y={height - 6} fontSize="9" fill="var(--dash-text-muted)" textAnchor="middle">
                {formatDate(d.date)}
              </text>
            )}
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(x(hoverIndex) / width) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--dash-text)',
            color: 'var(--dash-bg)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            marginTop: '-8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{formatDate(data[hoverIndex].date)}</div>
          <div>Visites : {data[hoverIndex].visits}</div>
          <div>Leads : {data[hoverIndex].leads}</div>
        </div>
      )}
    </div>
  )
}
