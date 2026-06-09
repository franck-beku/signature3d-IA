/**
 * /realisations/[secteur] — Projets publiés d'un secteur (connecté au backend)
 * Clic sur un projet → /embed/[slug]
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import { projectsApi, sectorsApi, type ProjectCardDto, type SectorDto } from '@/lib/api'

/** Génère l'URL de la vignette d'un espace Matterport. */
function getMatterportThumb(matterportId?: string): string | null {
  if (!matterportId) return null
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb?width=1200&dpr=1&disable=upscale`
}

const GOLD = '#D4881E'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=85&auto=format&fit=crop'

export default function SecteurPage() {
  const params = useParams()
  const secteurSlug = params.secteur as string

  const [sector, setSector]       = useState<SectorDto | null>(null)
  const [projects, setProjects]   = useState<ProjectCardDto[]>([])
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [sectorRes, projectsRes] = await Promise.all([
          sectorsApi.getBySlug(secteurSlug).catch(() => null),
          projectsApi.getBySector(secteurSlug),
        ])
        if (!sectorRes) { setNotFound(true) }
        else setSector(sectorRes as SectorDto)
        setProjects(projectsRes as ProjectCardDto[])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [secteurSlug])

  const secteurNom = sector?.name ?? secteurSlug
  const totalExp = projects.length

  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: '76px' }}>

        {/* Header */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '64px 0 48px' }}>
          <div className="container-main">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <Link href="/realisations" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#999', textDecoration: 'none' }} className="breadcrumb-link">
                <ArrowLeft size={14} /> Réalisations
              </Link>
              <span style={{ color: '#DDD' }}>/</span>
              <span style={{ fontSize: '13px', color: GOLD, fontWeight: 600 }}>{secteurNom}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: GOLD, marginBottom: '12px' }}>
                  {secteurNom}
                </span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                  Expériences {secteurNom.toLowerCase()}
                </h1>
              </div>
              {!loading && (
                <p style={{ fontSize: '14px', color: '#999', fontWeight: 400, margin: 0 }}>
                  {totalExp} expérience{totalExp > 1 ? 's' : ''} disponible{totalExp > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Grille */}
        <section style={{ backgroundColor: '#FAFAF8', padding: '0 0 96px', minHeight: '300px' }}>
          <div className="container-main">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#999', fontSize: '15px' }}>Chargement...</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
                <p style={{ fontSize: '16px' }}>Expériences bientôt disponibles.</p>
                <Link href="/realisations" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: GOLD, fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> Retour aux réalisations
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="exp-grid">
                {projects.map((exp) => {
                  const image = exp.coverImage || getMatterportThumb(exp.matterportId) || FALLBACK_IMAGE
                  return (
                    <div key={exp.slug} style={{ borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.07)', overflow: 'hidden', backgroundColor: '#111111', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.35s ease' }} className="exp-card">

                      {/* Image */}
                      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
                        <img src={image} alt={exp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} className="exp-img" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                        {/* Badge offre (au lieu du secteur) */}
                        {exp.offeringName && (
                          <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                            <span style={{ borderRadius: '999px', backgroundColor: 'rgba(212,136,30,0.9)', padding: '5px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#FFFFFF' }}>
                              {exp.offeringName}
                            </span>
                          </div>
                        )}

                        {/* Badge Live */}
                        <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 12px', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', animation: 'pulse 2s infinite' }} />
                            Live
                          </span>
                        </div>

                        {/* Hover overlay */}
                        <Link href={`/embed/${exp.slug}`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease', backgroundColor: 'rgba(0,0,0,0.3)', textDecoration: 'none' }} className="exp-overlay">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '999px', backgroundColor: GOLD, padding: '11px 22px', fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                            <Play size={12} style={{ fill: '#fff' }} /> Voir l&apos;expérience
                          </div>
                        </Link>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '18px 20px', backgroundColor: '#111111' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                          {exp.name}
                        </h3>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>
                          {exp.shortDescription || 'Expérience immersive Signature.'}
                        </p>
                        {/* Caractéristiques (Prix, Kilométrage...) */}
                        {exp.details && exp.details.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                            {exp.details.map((d) => (
                              <div key={d.id} style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
                                  {d.label}
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: GOLD, lineHeight: 1.3 }}>
                                  {d.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Link href={`/embed/${exp.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: GOLD, textDecoration: 'none', transition: 'gap 0.2s ease' }} className="voir-link">
                          Voir l&apos;expérience <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />

      <style>{`
        .breadcrumb-link:hover { color: ${GOLD} !important; }
        .exp-card:hover { box-shadow: 0 24px 64px rgba(0,0,0,0.25) !important; transform: translateY(-4px); border-color: rgba(212,136,30,0.3) !important; }
        .exp-card:hover .exp-img { transform: scale(1.04); }
        .exp-card:hover .exp-overlay { opacity: 1 !important; }
        .voir-link:hover { gap: 10px !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 1024px) { .exp-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .exp-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  )
}