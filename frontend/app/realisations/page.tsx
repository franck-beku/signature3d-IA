/**
 * /realisations — Liste des secteurs (connectée au backend)
 * Charte V2 : fond crème lumineux, Cormorant, halo doré, apparitions Framer.
 * Affiche les secteurs ACTIFS depuis l'API. Clic → /realisations/[secteur]
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { sectorsApi, type SectorDto } from '@/lib/api'

/* ── Charte V2 (identique à l'accueil / Final / Contact) ── */
const GOLD = '#C8A45D'
const CREAM = '#F7F5F2'
const INK = '#101010'

/* Images de secours par nom de secteur (si coverImage vide en base) */
const SECTEUR_IMAGES: Record<string, string> = {
  'Automobile': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=85&auto=format&fit=crop',
  'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85&auto=format&fit=crop',
  'Immobilier': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85&auto=format&fit=crop',
  'Hôtellerie': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
  'Commerce':   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85&auto=format&fit=crop',
}

const FALLBACK_IMAGE = SECTEUR_IMAGES['Automobile']

export default function RealisationsPage() {
  const { t } = useLanguage()
  const [secteurs, setSecteurs] = useState<SectorDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sectorsApi.getActive()
      .then((res) => setSecteurs(res as SectorDto[]))
      .catch(() => setSecteurs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, ${CREAM} 60%, #F1EEE8 100%)` }}>
      <Navbar />

      <div style={{ paddingTop: '76px', position: 'relative', overflow: 'hidden' }}>
        {/* halo doré ambiant (cohérent accueil/Final) */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(50% 30% at 50% 8%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Hero section */}
        <section style={{ padding: '72px 0 56px', position: 'relative', zIndex: 1 }}>
          <div className="container-main" style={{ textAlign: 'center' }}>
            <motion.span
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'inline-block', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.32em',
                color: GOLD, marginBottom: '18px',
              }}
            >
              {t('Nos réalisations', 'Our work')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                fontWeight: 500, color: INK,
                letterSpacing: '-0.01em', lineHeight: 1.06, marginBottom: '22px',
              }}
            >
              {t('Expériences immersives livrées', 'Immersive experiences delivered')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxWidth: '540px', margin: '0 auto', fontSize: '16px', lineHeight: 1.75, color: '#6B6458', fontWeight: 400 }}
            >
              {t(
                "Découvrez nos réalisations par secteur — chaque expérience est unique, personnalisée et accessible depuis n'importe quel appareil.",
                'Discover our work by sector — each experience is unique, personalized and accessible from any device.'
              )}
            </motion.p>
          </div>
        </section>

        {/* Grille secteurs */}
        <section style={{ padding: '0 0 96px', minHeight: '300px', position: 'relative', zIndex: 1 }}>
          <div className="container-main">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8E78', fontSize: '15px' }}>{t('Chargement…', 'Loading…')}</div>
            ) : secteurs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8E78', fontSize: '15px' }}>{t('Aucun secteur disponible pour le moment.', 'No sector available at the moment.')}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="secteurs-grid">
                {secteurs.map((secteur, index) => {
                  const image = secteur.coverImage || secteur.imageUrl || SECTEUR_IMAGES[secteur.name] || FALLBACK_IMAGE
                  return (
                    <motion.div
                      key={secteur.slug}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={`/realisations/${secteur.slug}`}
                        style={{
                          display: 'block', borderRadius: '22px', overflow: 'hidden',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 18px 50px -28px rgba(0,0,0,0.22)', textDecoration: 'none',
                          transition: 'all 0.35s ease',
                        }}
                        className="secteur-card"
                      >
                        <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                          <img src={image} alt={secteur.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} className="secteur-img" />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,11,11,0.66) 0%, rgba(11,11,11,0.1) 60%, transparent 100%)' }} />
                          <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2.2rem', fontWeight: 500, color: '#FFFFFF', margin: 0, letterSpacing: '0' }}>
                              {secteur.name}
                            </h2>
                          </div>
                        </div>
                        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 400, color: '#6B6458' }}>
                            {secteur.description || t('Découvrir les expériences', 'Discover experiences')}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: GOLD, flexShrink: 0 }}>
                            {t('Voir tout', 'View all')} <ArrowRight size={13} />
                          </span>
                        </div>
                      </Link>
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
        .secteur-card:hover { box-shadow: 0 28px 64px -24px rgba(0,0,0,0.28) !important; transform: translateY(-4px); }
        .secteur-card:hover .secteur-img { transform: scale(1.04); }
        @media (max-width: 1024px) { .secteurs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .secteurs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  )
}
