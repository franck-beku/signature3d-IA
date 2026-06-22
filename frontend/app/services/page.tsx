/**
 * Page Services — Signature Immersion
 * Charte V2 : éditoriale, très aérée, typographie Cormorant comme matière.
 * Chaque offre = un bloc immersif (numéro géant en fond, nom, niveau, description).
 * Branchée sur offeringsApi.getActive() · ordre piloté par displayOrder · multilingue · blindée.
 */

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { offeringsApi, type OfferingDto } from '@/lib/api'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'

/* ── Charte V2 ── */
const GOLD = '#C8A45D'
const CREAM = '#F7F5F2'
const INK = '#101010'

export default function ServicesPage() {
  const { t, lang } = useLanguage()

  const [offerings, setOfferings] = useState<OfferingDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    offeringsApi
      .getActive()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setOfferings([...data].sort((a, b) => a.displayOrder - b.displayOrder))
        }
      })
      .catch(() => { /* silencieux — la page ne doit pas casser */ })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <main
      key={lang}
      style={{
        minHeight: '100vh',
        background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, ${CREAM} 60%, #F1EEE8 100%)`,
      }}
    >
      <Navbar />

      {/* ── Introduction éditoriale ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '170px', paddingBottom: '80px' }}>
        {/* halo doré ambiant */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(45% 30% at 30% 12%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="container-main" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="section-eyebrow" style={{ color: GOLD }}
          >
            {t('Nos solutions', 'Our solutions')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.6rem)',
              fontWeight: 500,
              lineHeight: 1.06,
              color: INK,
              letterSpacing: '-0.01em',
              maxWidth: '720px',
            }}
          >
            {t(
              'Une expérience immersive pour chaque espace.',
              'An immersive experience for every space.'
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: '1.75rem',
              fontSize: '1.12rem',
              lineHeight: 1.75,
              color: '#5A4E3A',
              maxWidth: '560px',
              fontWeight: 400,
            }}
          >
            {t(
              "Chaque espace est unique. Nous concevons l'expérience adaptée à vos objectifs, à votre environnement et à vos visiteurs — de la simple immersion à l'intelligence conversationnelle.",
              'Every space is unique. We design the experience that fits your goals, your environment and your visitors — from pure immersion to conversational intelligence.'
            )}
          </motion.p>
        </div>
      </section>

      {/* ── Les offres : blocs immersifs ── */}
      <section style={{ paddingBottom: '40px' }}>
        <div className="container-main">

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8A7A5A', fontSize: '0.9rem' }}>
              {t('Chargement…', 'Loading…')}
            </div>
          ) : offerings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8A7A5A', fontSize: '0.95rem' }}>
              {t(
                'Nos solutions seront bientôt présentées ici. Écrivez-nous en attendant.',
                'Our solutions will be presented here soon. Reach out in the meantime.'
              )}
            </div>
          ) : (
            offerings.map((offer, index) => {
              const num = String(index + 1).padStart(2, '0')
              const isLast = index === offerings.length - 1
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.6fr)',
                    gap: '40px',
                    padding: '64px 0',
                    borderBottom: isLast ? 'none' : '1px solid #E8E2D4',
                  }}
                  className="offer-block"
                >
                  {/* Colonne gauche : numéro géant + niveau */}
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontSize: 'clamp(4rem, 9vw, 8rem)',
                      fontWeight: 500,
                      lineHeight: 0.9,
                      color: 'transparent',
                      WebkitTextStroke: `1px ${GOLD}`,
                      display: 'block',
                      opacity: 0.55,
                    }}>
                      {num}
                    </span>
                    {offer.level && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        color: GOLD,
                        border: `1px solid rgba(200,164,93,0.35)`,
                        borderRadius: '40px',
                        padding: '7px 16px',
                      }}>
                        {offer.level}
                      </span>
                    )}
                  </div>

                  {/* Colonne droite : nom + descriptions */}
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                      color: INK,
                      marginBottom: '0.6rem',
                      letterSpacing: '-0.01em',
                    }}>
                      {offer.name}
                    </h2>
                    {offer.shortDescription && (
                      <p style={{
                        fontSize: '1.1rem',
                        color: GOLD,
                        fontWeight: 400,
                        marginBottom: '1.25rem',
                        fontStyle: 'italic',
                        fontFamily: 'var(--font-cormorant), serif',
                      }}>
                        {offer.shortDescription}
                      </p>
                    )}
                    {offer.longDescription && (
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: 1.8,
                        color: '#5A4E3A',
                        fontWeight: 400,
                        maxWidth: '560px',
                      }}>
                        {offer.longDescription}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ backgroundColor: '#0B0B0B', paddingTop: '88px', paddingBottom: '88px' }}>
        <div className="container-main" style={{ textAlign: 'center' }}>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 500,
              color: CREAM,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {t('Trouvons la solution faite pour vous.', 'Let\u2019s find the right fit for you.')}
          </motion.h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(247,245,242,0.6)',
            fontWeight: 400,
            maxWidth: '480px',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            {t(
              'Présentez-nous votre espace : nous concevons l\u2019expérience immersive qui lui correspond.',
              'Tell us about your space: we\u2019ll design the immersive experience that fits it.'
            )}
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: GOLD,
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '15px 34px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 18px 40px -16px rgba(200,164,93,0.55)',
            }}
            className="services-cta"
          >
            {t('Demander une démonstration', 'Request a demonstration')}
            <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        .services-cta:hover { transform: translateY(-1px); box-shadow: 0 22px 48px -16px rgba(200,164,93,0.6) !important; }
        @media (max-width: 768px) {
          .offer-block { grid-template-columns: 1fr !important; gap: 16px !important; padding: 44px 0 !important; }
        }
      `}</style>
    </main>
  )
}
