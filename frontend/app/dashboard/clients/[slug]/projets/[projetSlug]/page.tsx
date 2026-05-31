'use client'

import { useState } from 'react'
import { use } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft, Copy, Download, Upload, FileText, Mail, Phone, Check } from 'lucide-react'

const projetsData: Record<string, {
  name: string; clientName: string; clientSlug: string; matterportId: string
  status: string; ambassadorName: string; createdBy: string; createdAt: string
  leads: { id: string; name: string; email: string; phone: string; service: string; message: string; createdAt: string }[]
  documents: { id: string; name: string; size: string; isIndexed: boolean; uploadedAt: string }[]
  analytics: { visitors: number; leads: number; interactions: number; avgDuration: string; topQuestions: string[] }
}> = {
  'mercedes-voiture-1': {
    name: 'Mercedes CLE 53 AMG', clientName: 'Mercedes Québec', clientSlug: 'mercedes-quebec',
    matterportId: 'WJzvgHF44zq', status: 'actif', ambassadorName: 'Alex',
    createdBy: 'Franck Beku', createdAt: '2025-05-02',
    leads: [
      { id: '1', name: 'Jean Tremblay', email: 'jean.tremblay@gmail.com', phone: '+1 (418) 555-0101', service: 'Réserver un essai', message: 'Je suis intéressé par la CLE 53 AMG.', createdAt: '2025-05-17T10:23:00' },
      { id: '2', name: 'Marie Bouchard', email: 'marie.bouchard@hotmail.com', phone: '+1 (418) 555-0202', service: 'Demander un prix', message: 'Quel est le prix avec les options sport ?', createdAt: '2025-05-16T15:45:00' },
    ],
    documents: [
      { id: '1', name: 'Fiche technique CLE 53 AMG.pdf', size: '2.4 MB', isIndexed: true, uploadedAt: '2025-05-02' },
      { id: '2', name: 'Garanties Mercedes.pdf', size: '1.2 MB', isIndexed: false, uploadedAt: '2025-05-10' },
    ],
    analytics: { visitors: 156, leads: 12, interactions: 89, avgDuration: '4m 32s', topQuestions: ['Prix du véhicule', 'Options disponibles', 'Garantie', 'Délai de livraison'] },
  },
  'mercedes-voiture-2': {
    name: 'Mercedes Showroom', clientName: 'Mercedes Québec', clientSlug: 'mercedes-quebec',
    matterportId: 'Fg8etsLyrWz', status: 'actif', ambassadorName: 'Alex',
    createdBy: 'Franck Beku', createdAt: '2025-05-03',
    leads: [], documents: [],
    analytics: { visitors: 124, leads: 8, interactions: 54, avgDuration: '3m 18s', topQuestions: ['Horaires', 'Itinéraire', 'Modèles disponibles'] },
  },
  'mercedes-voiture-3': {
    name: 'Mercedes Collection', clientName: 'Mercedes Québec', clientSlug: 'mercedes-quebec',
    matterportId: 'gTHjEVgJEbZ', status: 'actif', ambassadorName: 'Alex',
    createdBy: 'Alain Dubé', createdAt: '2025-05-05',
    leads: [], documents: [],
    analytics: { visitors: 62, leads: 3, interactions: 28, avgDuration: '2m 45s', topQuestions: ['Financement', 'Prix'] },
  },
}

const cardStyle = { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '20px' }

export default function ProjetDetailPage({ params }: { params: Promise<{ slug: string; projetSlug: string }> }) {
  const { slug, projetSlug } = use(params)
  const projet = projetsData[projetSlug]
  const [copied, setCopied] = useState(false)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)

  const embedUrl = `https://signature3d.ai/embed/${projetSlug}`
  const handleCopy = () => { navigator.clipboard.writeText(embedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (!projet) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>Projet introuvable</p>
            <Link href={`/dashboard/clients/${slug}`} style={{ color: '#d4af37', textDecoration: 'none', fontSize: '14px' }}>← Retour au client</Link>
          </div>
        </main>
      </div>
    )
  }

  const selectedLeadData = projet.leads.find((l) => l.id === selectedLead)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href={`/dashboard/clients/${slug}`} style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', textDecoration: 'none', transition: 'color 0.2s ease' }} className="back-arrow">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href={`/dashboard/clients/${slug}`} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s ease' }} className="client-link">{projet.clientName}</Link>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>/</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 300, color: 'white', margin: 0 }}>{projet.name}</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '999px', backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>{projet.status}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Créé par {projet.createdBy} · {new Date(projet.createdAt).toLocaleDateString('fr-CA')}</span>
              </div>
            </div>
          </div>
          <Link href={`/embed/${projetSlug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#d4af37', color: '#000', fontSize: '12px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }} className="new-btn">
            Voir l&apos;expérience →
          </Link>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Preview + Lien + Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }} className="preview-grid">

            {/* Preview */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '240px' }}>
                <iframe src={`https://my.matterport.com/show/?m=${projet.matterportId}&play=1&qs=1`} style={{ width: '100%', height: '100%', border: 'none' }} title={projet.name} />
              </div>
            </div>

            {/* Lien + QR + Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={cardStyle}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Lien de l&apos;expérience</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ flex: 1, fontSize: '11px', color: 'rgba(212,175,55,0.8)', backgroundColor: '#1a1a1a', padding: '8px 12px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{embedUrl}</code>
                  <button onClick={handleCopy} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer', flexShrink: 0 }} className="copy-btn">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div style={cardStyle}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>QR Code</p>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#999', fontSize: '10px', textAlign: 'center' }}>QR Code bientôt</p>
                  </div>
                </div>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '11px', padding: '8px', borderRadius: '8px', background: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="dl-btn">
                  <Download size={12} /> Télécharger PNG
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white', margin: 0 }}>{projet.analytics.visitors}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Visiteurs</p>
                </div>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: '#d4af37', margin: 0 }}>{projet.analytics.leads}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Leads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', margin: 0 }}>Documents — {projet.documents.length}</h2>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '8px', background: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="upload-btn">
                <Upload size={11} /> Uploader un PDF
              </button>
            </div>
            {projet.documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun document uploadé</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projet.documents.map((doc, i) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < projet.documents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={13} style={{ color: '#d4af37' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{doc.size}</p>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', flexShrink: 0, backgroundColor: doc.isIndexed ? 'rgba(74,222,128,0.1)' : 'rgba(212,175,55,0.1)', color: doc.isIndexed ? '#4ade80' : '#d4af37' }}>
                      {doc.isIndexed ? 'Indexé' : 'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads */}
          <div style={cardStyle}>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', marginBottom: '16px' }}>Leads reçus — {projet.leads.length}</h2>
            {projet.leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Aucun lead pour ce projet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projet.leads.map((lead) => (
                    <div key={lead.id} onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)} style={{ padding: '12px', borderRadius: '10px', border: selectedLead === lead.id ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.05)', backgroundColor: selectedLead === lead.id ? 'rgba(212,175,55,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s ease' }} className="lead-row">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#d4af37', fontSize: '12px', fontWeight: 500 }}>{lead.name[0]}</span>
                          </div>
                          <div>
                            <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{lead.name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{lead.service}</p>
                          </div>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>{new Date(lead.createdAt).toLocaleDateString('fr-CA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedLeadData && (
                  <div style={{ width: '240px', flexShrink: 0, backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ color: '#d4af37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Détail</p>
                    <div>
                      <p style={{ color: 'white', fontWeight: 500, fontSize: '14px', margin: 0 }}>{selectedLeadData.name}</p>
                      <p style={{ color: '#d4af37', fontSize: '11px' }}>{selectedLeadData.service}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={12} style={{ color: '#d4af37' }} />
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLeadData.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={12} style={{ color: '#d4af37' }} />
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{selectedLeadData.phone}</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#111', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '4px' }}>Message</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', lineHeight: 1.6 }}>{selectedLeadData.message}</p>
                    </div>
                    <button onClick={() => { window.location.href = 'mailto:' + selectedLeadData.email }} style={{ backgroundColor: '#d4af37', color: '#000', fontSize: '11px', fontWeight: 600, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} className="reply-btn">
                      Répondre par email
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytics */}
          <div style={cardStyle}>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '13px', marginBottom: '20px' }}>Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }} className="analytics-grid">
              {[
                { label: 'Visiteurs', value: projet.analytics.visitors, color: 'white' },
                { label: 'Leads', value: projet.analytics.leads, color: '#d4af37' },
                { label: 'Interactions IA', value: projet.analytics.interactions, color: '#4ade80' },
                { label: 'Durée moyenne', value: projet.analytics.avgDuration, color: '#60a5fa' },
              ].map((stat) => (
                <div key={stat.label} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Questions fréquentes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projet.analytics.topQuestions.map((q, i) => (
                <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '11px', width: '16px' }}>{i + 1}</span>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#1a1a1a', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'rgba(212,175,55,0.5)', borderRadius: '999px', width: `${100 - i * 18}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', width: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .back-arrow:hover { color: #d4af37 !important; }
        .client-link:hover { color: #d4af37 !important; }
        .new-btn:hover { background-color: #c9a84c !important; }
        .copy-btn:hover { color: #d4af37 !important; border-color: rgba(212,175,55,0.3) !important; }
        .dl-btn:hover { border-color: rgba(212,175,55,0.3) !important; color: #d4af37 !important; }
        .upload-btn:hover { border-color: rgba(212,175,55,0.3) !important; color: #d4af37 !important; }
        .lead-row:hover { border-color: rgba(255,255,255,0.15) !important; }
        .reply-btn:hover { background-color: #c9a84c !important; }
        @media (max-width: 900px) {
          .preview-grid { grid-template-columns: 1fr !important; }
          .analytics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
