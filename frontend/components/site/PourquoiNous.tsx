/**
 * Services — Signature 3D IA
 * Version: 3.0 — Multilingue FR/EN
 */

'use client'

import { motion } from 'framer-motion'
import { Brain, Box, Layers, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const GOLD      = '#D4881E'
const GOLD_DARK = '#B8720F'
const DARK      = '#1A1400'

const content = {
  fr: {
    label:    'Nos services',
    title:    'Ce que nous offrons',
    subtitle: "Signature 3D IA transforme vos espaces physiques en expériences intelligentes capables d'informer, guider et convertir.",
    badge:    'Recommandé',
    services: [
      { icon: Box,    tag: 'Visite 3D',   title: 'Matterport Pro',    description: "Captation immersive professionnelle de votre espace. Accessible depuis n'importe quel appareil, à tout moment, sans installation.", features: ['Qualité 4K', 'Navigation libre', 'Compatible mobile'], featured: false },
      { icon: Layers, tag: 'Combiné',     title: 'Matterport + IA',   description: "L'expérience complète : visite 3D immersive avec Luxedia IA intégré. Interface 80/20 conçue pour convertir les visiteurs en clients.", features: ['Interface 80/20', 'Leads qualifiés', 'Analytics inclus'], featured: true },
      { icon: Brain,  tag: 'Intelligence',title: 'Luxedia IA',        description: "Un agent intelligent nourri par vos vrais documents. Il répond avec précision, guide les visiteurs et transmet les leads automatiquement.", features: ['Vos documents', 'Réponses précises', 'Leads automatiques'], featured: false },
    ],
  },
  en: {
    label:    'Our services',
    title:    'What we offer',
    subtitle: 'Signature 3D IA transforms your physical spaces into intelligent experiences that inform, guide and convert.',
    badge:    'Recommended',
    services: [
      { icon: Box,    tag: '3D Tour',      title: 'Matterport Pro',    description: 'Professional immersive capture of your space. Accessible from any device, at any time, without installation.', features: ['4K quality', 'Free navigation', 'Mobile friendly'], featured: false },
      { icon: Layers, tag: 'Combined',     title: 'Matterport + AI',   description: 'The complete experience: immersive 3D tour with integrated Luxedia AI. 80/20 interface designed to convert visitors into clients.', features: ['80/20 interface', 'Qualified leads', 'Analytics included'], featured: true },
      { icon: Brain,  tag: 'Intelligence', title: 'Luxedia AI',        description: 'An intelligent agent fed by your real documents. It answers precisely, guides visitors and forwards leads automatically.', features: ['Your documents', 'Precise answers', 'Automatic leads'], featured: false },
    ],
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden:   { opacity: 0, y: 28 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function PourquoiNous() {
  const { lang } = useLanguage()
  const c = content[lang]

  return (
    <section id="services" style={{ backgroundColor: '#FFFFFF', padding: '104px 0 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(212,136,30,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD }}>{c.label}</span>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>{c.title}</h2>
          <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75, color: '#6B6458', fontWeight: 300 }}>{c.subtitle}</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'center' }} className="services-grid-custom">
          {c.services.map((service) => (
            <motion.div key={service.title} variants={cardVariants} className="service-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: service.featured ? `1.5px solid ${GOLD}` : '1.5px solid #E8E2D4', backgroundColor: service.featured ? DARK : '#FFFFFF', padding: service.featured ? '40px 32px' : '32px', boxShadow: service.featured ? '0 32px 80px rgba(26,20,0,0.18)' : '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.3s ease', transform: service.featured ? 'scale(1.03)' : 'scale(1)' }}>

              {service.featured && (
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ display: 'inline-block', borderRadius: '6px', backgroundColor: GOLD, padding: '5px 18px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#FFFFFF', whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
              )}

              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 700, color: service.featured ? 'rgba(212,136,30,0.8)' : GOLD, marginBottom: '20px', display: 'block' }}>{service.tag}</span>

              <div style={{ width: '52px', height: '52px', borderRadius: '12px', border: service.featured ? '1px solid rgba(212,136,30,0.25)' : '1.5px solid #E8E2D4', backgroundColor: service.featured ? 'rgba(212,136,30,0.1)' : '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <service.icon size={22} strokeWidth={1.4} style={{ color: service.featured ? GOLD : GOLD_DARK }} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, color: service.featured ? '#FFFFFF' : DARK, marginBottom: '12px', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{service.title}</h3>

              <p style={{ fontSize: '13.5px', lineHeight: 1.75, color: service.featured ? 'rgba(255,255,255,0.5)' : '#6B6458', flex: 1, marginBottom: '28px', fontWeight: 300 }}>{service.description}</p>

              <ul style={{ borderTop: service.featured ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F0EBE0', paddingTop: '20px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {service.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: service.featured ? 'rgba(255,255,255,0.65)' : '#5A4E3A', fontWeight: 400 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, backgroundColor: service.featured ? 'rgba(212,136,30,0.18)' : 'rgba(212,136,30,0.08)', border: service.featured ? '1px solid rgba(212,136,30,0.3)' : '1px solid rgba(212,136,30,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={9} style={{ color: GOLD }} strokeWidth={2.5} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .service-card:not([style*="scale(1.03)"]):hover { transform: translateY(-4px) !important; border-color: rgba(212,136,30,0.3) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.08) !important; }
        .service-card[style*="scale(1.03)"]:hover { transform: scale(1.03) translateY(-4px) !important; box-shadow: 0 40px 96px rgba(26,20,0,0.22) !important; }
        @media (max-width: 900px) { .services-grid-custom { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; } .service-card[style*="scale(1.03)"] { transform: scale(1) !important; } }
      `}</style>
    </section>
  )
}
