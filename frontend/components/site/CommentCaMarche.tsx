/**
 * Comment ça marche — Signature 3D IA
 * Version: 3.0 — Multilingue FR/EN
 */

'use client'

import { motion } from 'framer-motion'
import { Camera, FileText, Brain, Zap } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const GOLD      = '#D4881E'
const DARK      = '#1A1400'

const content = {
  fr: {
    label:    'Notre processus',
    title:    'Comment ça marche',
    subtitle: 'Une approche simple et rapide pour transformer vos espaces physiques en expériences intelligentes.',
    cta:      'Démarrer mon projet',
    steps: [
      { icon: Camera,   number: '01', title: 'Captation immersive',        description: "Nous filmons votre espace avec la technologie Matterport 4K pour un rendu réaliste et fluide.",               detail: "Accessible depuis n'importe quel appareil, à tout moment." },
      { icon: FileText, number: '02', title: 'Intégration de vos contenus', description: 'Vos menus, fiches et documents sont intégrés directement dans la visite immersive.',                          detail: "Votre contenu prend vie dans l'espace 3D." },
      { icon: Brain,    number: '03', title: 'IA contextuelle Luxedia',     description: 'Luxedia guide chaque visiteur avec précision 24h/24 — informe, conseille et convertit.',                      detail: 'Personnalisée à votre univers et vos documents.' },
      { icon: Zap,      number: '04', title: 'Expérience livrée',           description: 'Un lien unique et un QR code prêts à partager. Aucune installation requise.',                                  detail: 'Votre expérience est live en quelques jours.' },
    ],
  },
  en: {
    label:    'Our process',
    title:    'How it works',
    subtitle: 'A simple and fast approach to transform your physical spaces into intelligent experiences.',
    cta:      'Start my project',
    steps: [
      { icon: Camera,   number: '01', title: 'Immersive capture',       description: 'We film your space with Matterport 4K technology for a realistic and smooth rendering.',              detail: 'Accessible from any device, at any time.' },
      { icon: FileText, number: '02', title: 'Content integration',     description: 'Your menus, fact sheets and documents are integrated directly into the immersive visit.',             detail: 'Your content comes to life in the 3D space.' },
      { icon: Brain,    number: '03', title: 'Luxedia contextual AI',   description: 'Luxedia guides each visitor with precision 24/7 — informs, advises and converts.',                   detail: 'Personalized to your universe and your documents.' },
      { icon: Zap,      number: '04', title: 'Experience delivered',    description: 'A unique link and a QR code ready to share. No installation required.',                               detail: 'Your experience is live within a few days.' },
    ],
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}

const stepVariants = {
  hidden:   { opacity: 0, y: 28 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function CommentCaMarche() {
  const { lang } = useLanguage()
  const c = content[lang]

  return (
    <section id="comment" style={{ backgroundColor: '#FFFFFF', padding: '104px 0 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212,136,30,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(212,136,30,0.03) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD }}>{c.label}</span>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>
            {c.title}
          </h2>
          <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75, color: '#6B6458', fontWeight: 300 }}>{c.subtitle}</p>
        </motion.div>

        {/* Steps */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', position: 'relative' }} className="steps-container">
          <div className="connector-line" style={{ position: 'absolute', top: '40px', left: 'calc(12.5% + 32px)', right: 'calc(12.5% + 32px)', height: '1px', background: `linear-gradient(to right, ${GOLD}, rgba(212,136,30,0.2))`, zIndex: 0 }} />

          {c.steps.map((step, i) => (
            <motion.div key={step.title} variants={stepVariants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 20px', position: 'relative', zIndex: 1 }} className="step-item">
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <div className="step-circle" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: i === 0 ? DARK : '#FFFFFF', border: `1.5px solid ${i === 0 ? DARK : '#E8E2D4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', cursor: 'default' }}>
                  <step.icon size={22} strokeWidth={1.4} style={{ color: GOLD }} />
                </div>
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0' }}>
                  {i + 1}
                </span>
              </div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: DARK, marginBottom: '10px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{step.title}</h3>
              <p style={{ fontSize: '12.5px', lineHeight: 1.75, color: '#8A7A5A', fontWeight: 300, maxWidth: '200px', marginBottom: '14px' }}>{step.description}</p>
              <div style={{ padding: '10px 14px', background: 'rgba(212,136,30,0.06)', borderRadius: '8px', borderLeft: `2px solid ${GOLD}`, fontSize: '11.5px', color: '#6B6458', lineHeight: 1.55, textAlign: 'left', width: '100%', boxSizing: 'border-box' as const }}>
                {step.detail}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.55 }} style={{ textAlign: 'center', marginTop: '72px' }}>
          <a href="#contact" className="cta-process" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: DARK, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '14px 32px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.25s ease' }}>
            {c.cta}
            <span style={{ color: GOLD, fontSize: '16px', lineHeight: 1 }}>→</span>
          </a>
        </motion.div>
      </div>

      <style>{`
        .step-circle:hover { border-color: ${GOLD} !important; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(212,136,30,0.15); }
        .cta-process:hover { background-color: ${GOLD} !important; box-shadow: 0 8px 24px rgba(212,136,30,0.3); transform: translateY(-1px); }
        @media (max-width: 1024px) { .steps-container { grid-template-columns: repeat(2, 1fr) !important; gap: 48px !important; } .connector-line { display: none !important; } }
        @media (max-width: 560px)  { .steps-container { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  )
}
