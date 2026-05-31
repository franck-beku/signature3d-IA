/**
 * /realisations/[secteur] — Page dynamique par secteur
 * Version: 3.0 — Thumbnails Matterport réels + prix + kilométrage
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { projetsData, getMatterportThumb } from '@/config/projets'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'

const GOLD = '#D4881E'

function toSlug(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
}

export async function generateStaticParams() {
  const secteurs = [...new Set(Object.values(projetsData).map((p) => toSlug(p.category)))]
  return secteurs.map((secteur) => ({ secteur }))
}

interface Props {
  params: Promise<{ secteur: string }>
}

export default async function SecteurPage({ params }: Props) {
  const { secteur } = await params

  const secteurNom = Object.values(projetsData)
    .find((p) => toSlug(p.category) === secteur)?.category

  if (!secteurNom) return notFound()

  const projetsFiltered = Object.values(projetsData).filter(
    (p) => p.category === secteurNom
  )

  const experiences = projetsFiltered.flatMap((projet) =>
    projet.experiences.map((exp) => ({
      ...exp,
      clientName: projet.name,
      /* Thumbnail: custom si défini, sinon Matterport auto */
      image: exp.thumbnailUrl ?? getMatterportThumb(exp.matterportId),
    }))
  )

  const totalExp = experiences.length
  const isAuto = secteurNom === 'Automobile'

  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: '76px' }}>

        {/* Header */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '64px 0 48px' }}>
          <div className="container-main">

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <Link href="/realisations" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: '#999', textDecoration: 'none',
                transition: 'color 0.2s ease',
              }} className="breadcrumb-link">
                <ArrowLeft size={14} />
                Réalisations
              </Link>
              <span style={{ color: '#DDD' }}>/</span>
              <span style={{ fontSize: '13px', color: GOLD, fontWeight: 600 }}>{secteurNom}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  display: 'inline-block', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.3em',
                  color: GOLD, marginBottom: '12px',
                }}>
                  {secteurNom}
                </span>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700, color: '#0A0A0A',
                  letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
                }}>
                  Expériences {secteurNom.toLowerCase()}
                </h1>
              </div>
              <p style={{ fontSize: '14px', color: '#999', fontWeight: 400, margin: 0 }}>
                {totalExp} expérience{totalExp > 1 ? 's' : ''} disponible{totalExp > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Grille */}
        <section style={{ backgroundColor: '#FAFAF8', padding: '0 0 96px' }}>
          <div className="container-main">
            {experiences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
                <p style={{ fontSize: '16px' }}>Expériences bientôt disponibles.</p>
                <Link href="/realisations" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  marginTop: '16px', color: GOLD, fontSize: '14px',
                  fontWeight: 600, textDecoration: 'none',
                }}>
                  <ArrowLeft size={14} /> Retour aux réalisations
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }} className="exp-grid">
                {experiences.map((exp) => (
                  <div key={exp.slug} style={{
                    borderRadius: '20px',
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    backgroundColor: '#111111',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transition: 'all 0.35s ease',
                  }} className="exp-card">

                    {/* Image Matterport */}
                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
                      <img
                        src={exp.image}
                        alt={exp.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                        className="exp-img"
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                      {/* Badge secteur */}
                      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                        <span style={{
                          borderRadius: '999px',
                          backgroundColor: 'rgba(212,136,30,0.9)',
                          padding: '5px 12px',
                          fontSize: '10px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.15em',
                          color: '#FFFFFF',
                        }}>
                          {secteurNom}
                        </span>
                      </div>

                      {/* Badge Live */}
                      <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '5px 12px',
                          fontSize: '10px', fontWeight: 600,
                          color: 'rgba(255,255,255,0.92)',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', animation: 'pulse 2s infinite' }} />
                          Live
                        </span>
                      </div>

                      {/* Hover overlay */}
                      <Link href={`/embed/${exp.slug}`} style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.3s ease',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        textDecoration: 'none',
                      }} className="exp-overlay">
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          borderRadius: '999px', backgroundColor: GOLD,
                          padding: '11px 22px',
                          fontSize: '12px', fontWeight: 700, color: '#FFFFFF',
                        }}>
                          <Play size={12} style={{ fill: '#fff' }} />
                          Voir l&apos;expérience
                        </div>
                      </Link>
                    </div>

                    {/* Body — dark card comme Alain */}
                    <div style={{ padding: '18px 20px', backgroundColor: '#111111' }}>

                      {/* Nom expérience */}
                      <h3 style={{
                        fontSize: '16px', fontWeight: 600,
                        color: '#FFFFFF', marginBottom: '4px',
                        letterSpacing: '-0.01em',
                      }}>
                        {exp.name}
                      </h3>

                      {/* Description */}
                      <p style={{
                        fontSize: '12px', lineHeight: 1.5,
                        color: 'rgba(255,255,255,0.5)', marginBottom: '14px',
                      }}>
                        {exp.description}
                      </p>

                      {/* Prix + kilométrage — secteur automobile */}
                      {isAuto && exp.prix && exp.kilometrage && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          marginBottom: '16px',
                          padding: '10px 14px',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          {/* Miniature */}
                          <div style={{ width: '48px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#1a1a1a' }}>
                            <img src={exp.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '16px', fontWeight: 700, color: GOLD, margin: 0, lineHeight: 1 }}>
                              {exp.prix}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>
                              {exp.kilometrage}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <Link href={`/embed/${exp.slug}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '11px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.2em',
                        color: GOLD, textDecoration: 'none',
                        transition: 'gap 0.2s ease',
                      }} className="voir-link">
                        Voir l&apos;expérience <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
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
