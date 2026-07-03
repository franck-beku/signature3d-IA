/**
 * /realisations/[secteur] — Projets publiés d'un secteur (connecté au backend)
 * Charte V2 : cadre crème lumineux + Cormorant + halo doré + animations.
 * Cartes projets en charbon #0B0B0B (la vignette immersive ressort sur le sombre).
 * Clic sur un projet → /embed/[slug]
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { projectsApi, sectorsApi, type ProjectCardDto, type SectorDto } from '@/lib/api'

/* ── Charte V2 ── */
const GOLD = '#C8A45D'
const CREAM = '#F7F5F2'
const INK = '#101010'
const CHARCOAL = '#0B0B0B'

/** Génère l'URL de la vignette d'un espace Matterport. */
function getMatterportThumb(matterportId?: string): string | null {
  if (!matterportId) return null
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb?width=1200&dpr=1&disable=upscale`
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=85&auto=format&fit=crop'

export default function SecteurPage() {
  const { t, lang } = useLanguage()
  const params = useParams()
  const secteurSlug = params.secteur as string

  const [sector, setSector] = useState<SectorDto | null>(null)
  const [projects, setProjects] = useState<ProjectCardDto[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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
    <main style={{ minHeight: '100vh', background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, ${CREAM} 60%, #F1EEE8 100%)` }}>
      <Navbar />

      <div style={{ paddingTop: '76px', position: 'relative', overflow: 'hidden' }}>
        {/* halo doré ambiant */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(50% 28% at 50% 6%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <section style={{ padding: '64px 0 48px', position: 'relative', zIndex: 1 }}>
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}
            >
              <Link href="/realisations" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9A8E78', textDecoration: 'none' }} className="breadcrumb-link">
                <ArrowLeft size={14} /> {t('Réalisations', 'Our work')}
              </Link>
              <span style={{ color: '#D8CEBE' }}>/</span>
              <span style={{ fontSize: '13px', color: GOLD, fontWeight: 600 }}>{secteurNom}</span>
            </motion.div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <motion.span
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
                  style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.32em', color: GOLD, marginBottom: '14px' }}
                >
                  {secteurNom}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 500, color: INK, letterSpacing: '-0.01em', lineHeight: 1.08, margin: 0 }}
                >
                  {t('Expériences', 'Experiences')} {secteurNom.toLowerCase()}
                </motion.h1>
              </div>
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                  style={{ fontSize: '14px', color: '#9A8E78', fontWeight: 400, margin: 0 }}
                >
                  {t(
                    `${totalExp} expérience${totalExp > 1 ? 's' : ''} disponible${totalExp > 1 ? 's' : ''}`,
                    `${totalExp} experience${totalExp > 1 ? 's' : ''} available`
                  )}
                </motion.p>
              )}
            </div>
          </div>
        </section>

        {/* Grille */}
        <section style={{ padding: '0 0 96px', minHeight: '300px', position: 'relative', zIndex: 1 }}>
          <div className="container-main">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8E78', fontSize: '15px' }}>{t('Chargement…', 'Loading…')}</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8E78' }}>
                <p style={{ fontSize: '16px' }}>{t('Expériences bientôt disponibles.', 'Experiences coming soon.')}</p>
                <Link href="/realisations" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: GOLD, fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> {t('Retour aux réalisations', 'Back to our work')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="exp-grid">
                {projects.map((exp, index) => {
                  const image = exp.coverImage || getMatterportThumb(exp.matterportId) || FALLBACK_IMAGE
                  return (
                    <motion.div
                      key={exp.slug}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: CHARCOAL, boxShadow: '0 18px 50px -26px rgba(0,0,0,0.4)', transition: 'all 0.35s ease' }}
                      className="exp-card"
                    >
                      {/* Image */}
                      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: CHARCOAL }}>
                        <img src={image} alt={exp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} className="exp-img" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,11,11,0.7) 0%, rgba(11,11,11,0.1) 60%, transparent 100%)' }} />

                        {/* Badge offre */}
                        {exp.offeringName && (
                          <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                            <span style={{ borderRadius: '999px', backgroundColor: 'rgba(200,164,93,0.92)', padding: '5px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#FFFFFF' }}>
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
                            <Play size={12} style={{ fill: '#fff' }} /> {t("Voir l'expérience", 'View experience')}
                          </div>
                        </Link>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '18px 20px', backgroundColor: CHARCOAL }}>
                        <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.4rem', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px', letterSpacing: '0' }}>
                          {exp.name}
                        </h3>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>
                          {(lang === 'en' ? (exp.shortDescriptionEn || exp.shortDescription) : exp.shortDescription)
                            || t('Expérience immersive Signature.', 'Signature immersive experience.')}
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
                          {t("Voir l'expérience", 'View experience')} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </motion.div>
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
        .exp-card:hover { box-shadow: 0 28px 70px -22px rgba(0,0,0,0.5) !important; transform: translateY(-4px); }
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
