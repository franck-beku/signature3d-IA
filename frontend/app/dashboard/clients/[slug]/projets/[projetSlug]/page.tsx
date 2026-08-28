'use client'

import { useState, useEffect, useRef } from 'react'
import { use } from 'react'
import { pdf } from '@react-pdf/renderer'
import Sidebar from '@/components/dashboard/Sidebar'
import KPICard from '@/components/dashboard/KPICard'
import ReportDocument from '@/components/dashboard/ProjectReportPDF'
import QRCodeLogo from '@/components/dashboard/QRCodeLogo'
import Link from 'next/link'
import { ArrowLeft, Copy, Download, Upload, FileText, Mail, Phone, Check, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  projectsApi, documentsApi, leadsApi, statsApi,
  type ProjectDto, type DocumentDto, type LeadDto,
  type VisitStatsDto, type ProjectButtonClicksDto, type LeadStatsDto, type ProjectQuestionStatsDto,
} from '@/lib/api'

const cardStyle = { backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '20px' }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusStyle = (s: string) => {
  if (s === 'Active') return { bg: 'var(--dash-success-bg)', color: 'var(--dash-success)' }
  if (s === 'Draft')  return { bg: 'var(--dash-gold-muted)', color: 'var(--dash-gold)' }
  return                     { bg: 'var(--dash-border)',      color: 'var(--dash-text-subtle)' }
}

export default function ProjetDetailPage({ params }: { params: Promise<{ slug: string; projetSlug: string }> }) {
  const { slug, projetSlug } = use(params)

  const [project, setProject]   = useState<ProjectDto | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [documents, setDocuments]     = useState<DocumentDto[]>([])
  const [leads, setLeads]             = useState<LeadDto[]>([])
  const [copied, setCopied]           = useState(false)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)

  const [visitStats, setVisitStats]     = useState<VisitStatsDto | null>(null)
  const [buttonStats, setButtonStats]   = useState<ProjectButtonClicksDto | null>(null)
  const [leadStats, setLeadStats]       = useState<LeadStatsDto | null>(null)
  const [questionStats, setQuestionStats] = useState<ProjectQuestionStatsDto | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError]     = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc]   = useState(false)
  const [showQr, setShowQr]               = useState(false)
  const [ocrPendingIds, setOcrPendingIds] = useState<Set<string>>(new Set())
  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])

  useEffect(() => {
    projectsApi.getBySlug(projetSlug)
      .then((p) => setProject(p as ProjectDto))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [projetSlug])

  useEffect(() => {
    if (!project) return

    documentsApi.getByProject(project.id).then((docs) => setDocuments(docs as DocumentDto[]))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des documents.'))
    leadsApi.getByProject(project.id).then((ls) => setLeads(ls as LeadDto[]))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des leads.'))

    setStatsLoading(true)
    setStatsError(false)
    Promise.all([
      statsApi.getVisits(project.id),
      statsApi.getButtonClicks(project.id),
      statsApi.getLeads(project.id),
      statsApi.getQuestions(project.id),
    ])
      .then(([v, b, l, q]) => {
        setVisitStats(v)
        setButtonStats(b)
        setLeadStats(l)
        setQuestionStats(q)
      })
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false))
  }, [project])

  const handleUploadDocument = async (file: File) => {
    if (!project) return
    setUploadingDoc(true)
    try {
      const doc = await documentsApi.upload(project.id, file, false)
      setDocuments((prev) => [doc as DocumentDto, ...prev])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload du document.")
    } finally {
      setUploadingDoc(false)
    }
  }

  /** Enfile l'OCR puis poll toutes les 3s (max 20x = 60s) jusqu'à ce que l'état de la page change. */
  const pollOcrResult = (documentId: string, projectId: string, attempt = 0) => {
    if (attempt >= 20) {
      if (isMountedRef.current) setOcrPendingIds((prev) => { const next = new Set(prev); next.delete(documentId); return next })
      return
    }
    setTimeout(async () => {
      if (!isMountedRef.current) return
      try {
        const docs = await documentsApi.getByProject(projectId) as DocumentDto[]
        if (!isMountedRef.current) return
        setDocuments(docs)
        const updated = docs.find((d) => d.id === documentId)
        const stillProcessing = !!updated && updated.lowTextPageNumbers?.length > 0 && updated.ocrFailedPageNumbers?.length === 0
        if (stillProcessing) {
          pollOcrResult(documentId, projectId, attempt + 1)
        } else {
          setOcrPendingIds((prev) => { const next = new Set(prev); next.delete(documentId); return next })
        }
      } catch {
        pollOcrResult(documentId, projectId, attempt + 1)
      }
    }, 3000)
  }

  const handleRequestOcr = async (documentId: string) => {
    if (!project) return
    try {
      await documentsApi.requestOcrReindex(documentId)
      setOcrPendingIds((prev) => new Set(prev).add(documentId))
      pollOcrResult(documentId, project.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const embedUrl = project?.embedUrl ?? ''
  const handleCopy = () => {
    navigator.clipboard.writeText(embedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadReport = async () => {
    if (!project || !visitStats || !buttonStats || !leadStats || !questionStats) return
    setGeneratingPdf(true)
    try {
      const blob = await pdf(
        <ReportDocument
          project={{ name: project.name, clientName: project.clientName }}
          visitStats={visitStats}
          buttonStats={buttonStats}
          leadStats={leadStats}
          questionStats={questionStats}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${project.slug}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-bg)' }}>
          <p style={{ color: 'var(--dash-text-muted)' }}>Chargement...</p>
        </main>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--dash-text-subtle)', marginBottom: '16px' }}>Projet introuvable</p>
            <Link href={`/dashboard/clients/${slug}`} style={{ color: 'var(--dash-gold)', textDecoration: 'none', fontSize: '14px' }}>← Retour au client</Link>
          </div>
        </main>
      </div>
    )
  }

  const st = statusStyle(project.status)
  const selectedLeadData = leads.find((l) => l.id === selectedLead)

  const hasAnyStatsData = !!(visitStats && buttonStats && leadStats && questionStats) &&
    (visitStats.total > 0 || buttonStats.totalClicks > 0 || leadStats.total > 0 || questionStats.totalQuestions > 0)

  const convertedCount = leadStats?.byStatus.find((s) => s.status === 'Converti')?.count ?? 0
  const activeCategories = questionStats?.categories.filter((c) => c.count > 0) ?? []
  const maxCategoryCount = activeCategories.length ? Math.max(...activeCategories.map((c) => c.count)) : 1
  const maxButtonCount = buttonStats?.buttons.length ? Math.max(...buttonStats.buttons.map((b) => b.clickCount)) : 1

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href={`/dashboard/clients/${slug}`} style={{ color: 'var(--dash-text-muted)', display: 'flex', textDecoration: 'none', transition: 'color 0.2s ease' }} className="back-arrow">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href={`/dashboard/clients/${slug}`} style={{ color: 'var(--dash-text-muted)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s ease' }} className="client-link">{project.clientName}</Link>
                <span style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>/</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>{project.name}</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '999px', backgroundColor: st.bg, color: st.color }}>{project.status}</span>
                <span style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>Créé le {new Date(project.createdAt).toLocaleDateString('fr-CA')}</span>
              </div>
            </div>
          </div>
          <Link href={`/embed/${project.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }} className="new-btn">
            Voir l&apos;expérience →
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '10px', color: 'var(--dash-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Preview + Lien + Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }} className="preview-grid">

            {/* Preview */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '240px' }}>
                {project.experienceType === 'Matterport' && project.matterportId ? (
                  <iframe src={`https://my.matterport.com/show/?m=${project.matterportId}&play=1&qs=1`} style={{ width: '100%', height: '100%', border: 'none' }} title={project.name} />
                ) : project.experienceType === 'Tour360' && project.experienceUrl ? (
                  <iframe src={project.experienceUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={project.name} />
                ) : project.experienceType === 'IAOnly' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-input)' }}>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aperçu non disponible — expérience IA seule</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dash-input)' }}>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Configuration de la visite incomplète</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lien + QR + Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={cardStyle}>
                <p className="dash-micro-label" style={{ marginBottom: '10px' }}>Lien de l&apos;expérience</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ flex: 1, fontSize: '11px', color: 'var(--dash-gold)', backgroundColor: 'var(--dash-input)', padding: '8px 12px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{embedUrl}</code>
                  <button onClick={handleCopy} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--dash-border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: copied ? 'var(--dash-success)' : 'var(--dash-text-muted)', background: 'none', cursor: 'pointer', flexShrink: 0 }} className="copy-btn">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div style={cardStyle}>
                <p className="dash-micro-label" style={{ marginBottom: '10px' }}>QR Code</p>
                {/* backgroundColor: 'white' conservé — fond fonctionnel pour rendu QR */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#999', fontSize: '10px', textAlign: 'center' }}>QR Code bientôt</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQr(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-muted)', fontSize: '11px', padding: '8px', borderRadius: '8px', background: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  className="dl-btn"
                >
                  <Download size={12} /> Télécharger PNG
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--dash-text)', margin: 0 }}>{statsLoading ? '...' : (visitStats?.total ?? 0)}</p>
                  <p className="dash-micro-label">Visiteurs</p>
                </div>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--dash-gold)', margin: 0 }}>{statsLoading ? '...' : (leadStats?.total ?? 0)}</p>
                  <p className="dash-micro-label">Leads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>Documents — {documents.length}</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-muted)', padding: '6px 12px', borderRadius: '8px', background: 'none', cursor: uploadingDoc ? 'default' : 'pointer', transition: 'all 0.2s ease' }} className="upload-btn">
                <Upload size={11} /> {uploadingDoc ? 'Upload...' : 'Uploader un document'}
                <input
                  type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                  disabled={uploadingDoc}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDocument(f); e.target.value = '' }}
                />
              </label>
            </div>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--dash-border-input)', borderRadius: '10px' }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun document uploadé</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {documents.map((doc, i) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < documents.length - 1 ? '1px solid var(--dash-hover)' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={13} style={{ color: 'var(--dash-gold)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                      <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>{formatSize(doc.sizeBytes)}</p>
                    </div>
                    <span title={doc.indexingError} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', flexShrink: 0, backgroundColor: doc.isIndexed ? 'var(--dash-success-bg)' : 'var(--dash-gold-muted)', color: doc.isIndexed ? 'var(--dash-success)' : 'var(--dash-gold)', cursor: doc.indexingError ? 'help' : 'default' }}>
                      {doc.isIndexed ? 'Indexé' : 'En attente'}
                    </span>
                    {doc.isIndexed && doc.ocrFailedPageNumbers?.length > 0 ? (
                      <span
                        title={`Page${doc.ocrFailedPageNumbers.length > 1 ? 's' : ''} ${doc.ocrFailedPageNumbers.join(', ')} — OCR tenté sans succès, probablement illisible (image de mauvaise qualité ou sans texte réel).`}
                        style={{ display: 'flex', flexShrink: 0, cursor: 'help' }}
                      >
                        <AlertTriangle size={13} style={{ color: 'var(--dash-error)' }} />
                      </span>
                    ) : doc.isIndexed && doc.lowTextPageNumbers?.length > 0 && (
                      <>
                        <span
                          title={`Extraction possiblement incomplète — page${doc.lowTextPageNumbers.length > 1 ? 's' : ''} ${doc.lowTextPageNumbers.join(', ')} contiennent très peu de texte (probablement des encadrés en image). Le contenu de ces pages peut être absent des réponses de l'IA.`}
                          style={{ display: 'flex', flexShrink: 0, cursor: 'help' }}
                        >
                          <AlertTriangle size={13} style={{ color: 'var(--dash-gold)' }} />
                        </span>
                        <button
                          onClick={() => handleRequestOcr(doc.id)}
                          disabled={ocrPendingIds.has(doc.id)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', background: 'none', cursor: ocrPendingIds.has(doc.id) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-gold)', flexShrink: 0, opacity: ocrPendingIds.has(doc.id) ? 0.5 : 1 }}
                          title={ocrPendingIds.has(doc.id) ? 'OCR en cours...' : "Relancer l'OCR sur les pages faibles"}
                        >
                          <RefreshCw size={11} className={ocrPendingIds.has(doc.id) ? 'spin' : undefined} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads */}
          <div style={cardStyle}>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '16px' }}>Leads reçus — {leads.length}</h2>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun lead pour ce projet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leads.map((lead) => (
                    <div key={lead.id} onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)} style={{ padding: '12px', borderRadius: '10px', border: selectedLead === lead.id ? '1px solid var(--dash-gold)' : '1px solid var(--dash-border)', backgroundColor: selectedLead === lead.id ? 'var(--dash-gold-muted)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s ease' }} className="lead-row">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--dash-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--dash-gold)', fontSize: '12px', fontWeight: 500 }}>{lead.name?.[0]?.toUpperCase() ?? '?'}</span>
                          </div>
                          <div>
                            <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{lead.name ?? 'Anonyme'}</p>
                            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>{lead.buttonLabel}</p>
                          </div>
                        </div>
                        <span style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>{new Date(lead.createdAt).toLocaleDateString('fr-CA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedLeadData && (
                  <div style={{ width: '240px', flexShrink: 0, backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ color: 'var(--dash-gold)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Détail</p>
                    <div>
                      <p style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', margin: 0 }}>{selectedLeadData.name ?? 'Anonyme'}</p>
                      <p style={{ color: 'var(--dash-gold)', fontSize: '11px' }}>{selectedLeadData.buttonLabel}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedLeadData.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={12} style={{ color: 'var(--dash-gold)' }} />
                          <span style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLeadData.email}</span>
                        </div>
                      )}
                      {selectedLeadData.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={12} style={{ color: 'var(--dash-gold)' }} />
                          <span style={{ color: 'var(--dash-text-subtle)', fontSize: '11px' }}>{selectedLeadData.phone}</span>
                        </div>
                      )}
                    </div>
                    {selectedLeadData.message && (
                      <div style={{ backgroundColor: 'var(--dash-surface)', borderRadius: '8px', padding: '10px' }}>
                        <p style={{ color: 'var(--dash-text-muted)', fontSize: '10px', marginBottom: '4px' }}>Message</p>
                        <p style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', lineHeight: 1.6 }}>{selectedLeadData.message}</p>
                      </div>
                    )}
                    {selectedLeadData.email && (
                      <button onClick={() => { window.location.href = 'mailto:' + selectedLeadData.email }} style={{ backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '11px', fontWeight: 600, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="reply-btn">
                        Répondre par email
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Performance du projet */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Performance du projet</h2>
              <p className="dash-page-eyebrow" style={{ marginTop: '4px' }}>Preuve d&apos;engagement pour {project.clientName}</p>
            </div>

            {statsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--dash-gold-ring)', borderTopColor: 'var(--dash-gold)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : statsError ? (
              <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
                <p style={{ color: 'var(--dash-error)', fontSize: '13px' }}>Impossible de charger les statistiques pour l&apos;instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {!hasAnyStatsData && (
                  <div style={{ padding: '10px 16px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', borderRadius: '10px' }}>
                    <p style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', margin: 0 }}>Les statistiques se rempliront dès les premières visites.</p>
                  </div>
                )}

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="perf-kpi-grid">
                  <KPICard value={visitStats!.total} label="Visites" delta={`${visitStats!.last30Days} (30 derniers jours)`} />
                  <KPICard value={buttonStats!.totalClicks} label="Clics sur les boutons" />
                  <KPICard value={leadStats!.total} label="Leads" delta={convertedCount > 0 ? `${convertedCount} converti${convertedCount > 1 ? 's' : ''}` : undefined} />
                  <KPICard value={questionStats!.totalQuestions} label="Questions à Luxedia" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="perf-charts-grid">
                  {/* Questions par catégorie */}
                  <div style={cardStyle}>
                    <h3 className="dash-label" style={{ marginBottom: '16px' }}>Questions posées à Luxedia</h3>
                    {activeCategories.length === 0 ? (
                      <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucune question posée pour l&apos;instant</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeCategories.map((c) => (
                          <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category}</span>
                            <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--dash-input)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', backgroundColor: 'var(--dash-gold-icon)', borderRadius: '999px', width: `${(c.count / maxCategoryCount) * 100}%` }} />
                            </div>
                            <span style={{ color: 'var(--dash-text-muted)', fontSize: '12px', flexShrink: 0, minWidth: '20px', textAlign: 'right' }}>{c.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Boutons les plus cliqués */}
                  <div style={cardStyle}>
                    <h3 className="dash-label" style={{ marginBottom: '16px' }}>Boutons les plus cliqués</h3>
                    {buttonStats!.buttons.length === 0 ? (
                      <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucun clic enregistré pour l&apos;instant</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {buttonStats!.buttons.map((b) => (
                          <div key={b.buttonLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.buttonLabel}</span>
                            <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--dash-input)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', backgroundColor: 'var(--dash-success)', borderRadius: '999px', width: `${(b.clickCount / maxButtonCount) * 100}%` }} />
                            </div>
                            <span style={{ color: 'var(--dash-text-muted)', fontSize: '12px', flexShrink: 0, minWidth: '20px', textAlign: 'right' }}>{b.clickCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Évolution des visites — réservé, pas encore actif */}
                <div style={{ ...cardStyle, textAlign: 'center', padding: '32px' }}>
                  <TrendingUp size={22} style={{ color: 'var(--dash-border-input)', margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Graphique d&apos;évolution disponible prochainement</p>
                </div>

                {/* Rapport PDF */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleDownloadReport}
                    disabled={generatingPdf}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--dash-gold)', color: '#000', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: generatingPdf ? 'not-allowed' : 'pointer', opacity: generatingPdf ? 0.7 : 1, transition: 'all 0.2s ease' }}
                    className="pdf-btn"
                  >
                    <Download size={14} /> {generatingPdf ? 'Génération...' : 'Télécharger le rapport (PDF)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .back-arrow:hover  { color: var(--dash-gold) !important; }
        .client-link:hover { color: var(--dash-gold) !important; }
        .new-btn:hover     { background-color: #b8943d !important; }
        .pdf-btn:hover:not(:disabled) { background-color: #b8943d !important; }
        .copy-btn:hover    { color: var(--dash-gold) !important; border-color: var(--dash-gold-ring) !important; }
        .dl-btn:hover      { border-color: var(--dash-gold-ring) !important; color: var(--dash-gold) !important; }
        .upload-btn:hover  { border-color: var(--dash-gold-ring) !important; color: var(--dash-gold) !important; }
        .lead-row:hover    { border-color: var(--dash-border-input) !important; background-color: var(--dash-hover) !important; }
        .reply-btn:hover   { background-color: #b8943d !important; }
        @media (max-width: 900px) {
          .preview-grid      { grid-template-columns: 1fr !important; }
          .perf-kpi-grid     { grid-template-columns: repeat(2, 1fr) !important; }
          .perf-charts-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showQr && project && (
        <QRCodeLogo url={embedUrl} projectName={project.name} onClose={() => setShowQr(false)} />
      )}
    </div>
  )
}
