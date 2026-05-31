/**
 * Réalisations — Signature 3D IA
 * Version: 5.0 — Multilingue FR/EN + données PostgreSQL
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Play } from 'lucide-react'
import Link from 'next/link'
import { sectorsApi, type SectorDto } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'

const GOLD      = '#D4881E'
const GOLD_DARK = '#B8720F'
const DARK      = '#1A1400'

const DEFAULT_IMAGES: Record<string, string> = {
  'Automobile':   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=85&auto=format&fit=crop',
  'Restaurant':   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85&auto=format&fit=crop',
  'Immobilier':   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=85&auto=format&fit=crop',
  'Hôtellerie':   'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85&auto=format&fit=crop',
  'Commerce':     'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=85&auto=format&fit=crop',
  'Événementiel': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=85&auto=format&fit=crop',
}

const content = {
  fr: {
    label:       'Nos réalisations',
    title:       'Expériences immersives livrées',
    subtitle:    "Chaque expérience est unique, personnalisée et accessible depuis n'importe quel appareil.",
    loading:     'Chargement...',
    comingSoon:  'Prochainement',
    comingSoon2: 'Bientôt disponible',
    seeExp:      'Voir les expériences',
    clients:     (n: number) => `${n} client${n > 1 ? 's' : ''}`,
  },
  en: {
    label:       'Our portfolio',
    title:       'Immersive experiences delivered',
    subtitle:    'Each experience is unique, personalized and accessible from any device.',
    loading:     'Loading...',
    comingSoon:  'Coming soon',
    comingSoon2: 'Coming soon',
    seeExp:      'See experiences',
    clients:     (n: number) => `${n} client${n > 1 ? 's' : ''}`,
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Realisations() {
  const { lang } = useLanguage()
  const c = content[lang]
  const [sectors, setSectors] = useState<SectorDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sectorsApi.getAll()
      .then((data) => setSectors(data as SectorDto[]))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="realisations" style={{ backgroundColor: '#FFFFFF', padding: '104px 0 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(212,136,30,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD }}>{c.label}</span>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>{c.title}</h2>
          <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75, color: '#6B6458', fontWeight: 300 }}>{c.subtitle}</p>
        </motion.div>

        {/* Grille */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#C8C0B0', fontSize: '14px' }}>{c.loading}</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="realisations-grid-custom">
            {sectors.map((sector) => {
              const image     = DEFAULT_IMAGES[sector.name] ?? DEFAULT_IMAGES['Automobile']
              const available = sector.clientCount > 0

              return (
                <motion.div key={sector.id} variants={cardVariants} style={{ borderRadius: '16px', border: '1.5px solid #E8E2D4', overflow: 'hidden', backgroundColor: '#FFFFFF', transition: 'all 0.35s ease', opacity: available ? 1 : 0.7 }} className="card-realisation">

                  <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                    <img src={image} alt={sector.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} className="card-img" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

                    {/* Badge secteur */}
                    <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                      <span style={{ borderRadius: '6px', backgroundColor: 'rgba(26,20,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', padding: '5px 12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        {sector.name}
                      </span>
                    </div>

                    {/* Badge statut */}
                    <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                      {available ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', backgroundColor: 'rgba(26,20,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', padding: '5px 12px', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD, animation: 'pulse 2s infinite', display: 'block' }} />
                          {c.clients(sector.clientCount)}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px', backgroundColor: 'rgba(26,20,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 12px', fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          <Lock size={9} />
                          {c.comingSoon}
                        </span>
                      )}
                    </div>

                    {/* Hover overlay */}
                    {available && (
                      <Link href={`/realisations/${sector.slug}`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease', backgroundColor: 'rgba(26,20,0,0.25)', textDecoration: 'none' }} className="card-overlay">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', backgroundColor: GOLD, padding: '12px 24px', fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          <Play size={11} style={{ fill: '#fff' }} />
                          {c.seeExp}
                        </div>
                      </Link>
                    )}

                    {/* Titre secteur */}
                    <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>{sector.name}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px 22px 22px' }}>
                    <div style={{ height: '1px', backgroundColor: '#F0EBE0', marginBottom: '16px' }} />
                    {available ? (
                      <Link href={`/realisations/${sector.slug}`} className="voir-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: GOLD, textDecoration: 'none', transition: 'gap 0.2s ease' }}>
                        {c.seeExp}
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C8C0B0' }}>
                        <Lock size={11} />
                        {c.comingSoon2}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .card-realisation:hover { box-shadow: 0 20px 56px rgba(0,0,0,0.1) !important; transform: translateY(-5px); border-color: rgba(212,136,30,0.25) !important; }
        .card-realisation:hover .card-img { transform: scale(1.05); }
        .card-realisation:hover .card-overlay { opacity: 1 !important; }
        .voir-link:hover { gap: 10px !important; color: ${GOLD_DARK} !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @media (max-width: 1024px) { .realisations-grid-custom { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .realisations-grid-custom { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
