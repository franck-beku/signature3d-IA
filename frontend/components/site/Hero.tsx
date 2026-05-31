/**
 * Hero Section — Signature 3D IA
 * Version: 8.0 — Multilingue FR/EN via LanguageContext
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, ScanLine, Sparkles, BarChart2, Share2, Car, UtensilsCrossed, Building2, Hotel, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const GOLD         = '#C8981A'
const GOLD_DIM     = 'rgba(200,152,26,0.10)'
const GOLD_BORDER  = 'rgba(200,152,26,0.22)'
const DARK         = '#0C0B09'
const CREAM        = '#F8F5EF'
const TEXT_DARK    = '#15120A'
const TEXT_MID     = '#4A4030'
const TEXT_SOFT    = '#7A6E58'
const TEXT_MUTED   = '#A89E88'
const BORDER_LIGHT = 'rgba(180,160,120,0.18)'

const content = {
  fr: {
    eyebrow:    "L'intelligence immersive au service de votre image",
    title:      <>Transformez vos espaces<br />en expériences <em style={{ color: GOLD, fontStyle: 'italic' }}>360°</em> intelligentes</>,
    desc:       <>Offrez à vos clients une expérience immersive, interactive et accessible <strong style={{ color: TEXT_DARK, fontWeight: 500 }}>24h/24, 7j/7</strong> — grâce à la 3D <strong style={{ color: TEXT_DARK, fontWeight: 500 }}>Matterport</strong> et à l'intelligence artificielle <span style={{ color: GOLD, fontWeight: 500 }}>Luxedia</span>.</>,
    cta1:       'Voir une démo',
    cta2:       'Parler de mon projet',
    stat1sub:   'Technologie de capture 3D leader',
    stat2sub:   'Intelligence artificielle conversationnelle',
    online:     'En ligne',
    placeholder:'Votre question…',
    actions:    ['Actions rapides'],
    chatWelcome:'Bienvenue ! Je suis Luxedia, votre assistant IA. Comment puis-je vous aider ?',
    chatQ:      ['Quels sont vos services ?', 'Quel est le prix ?', 'Exemples de réalisations'],
    chatA:      'À partir de 5 900 $.\nEssai disponible !',
    quickBtns:  ['Réserver un essai', 'Demander un prix', 'Parler à un conseiller', 'Itinéraire concession'],
    secteurs: [
      { icon: Car,             label: 'Automobile', sub: 'Concessions & showrooms' },
      { icon: UtensilsCrossed, label: 'Restaurant', sub: 'Expériences culinaires'  },
      { icon: Building2,       label: 'Immobilier', sub: 'Agences & promoteurs'    },
      { icon: Hotel,           label: 'Hôtellerie', sub: 'Hôtels & hébergements'  },
      { icon: ShoppingBag,     label: 'Commerce',   sub: 'Magasins & boutiques'    },
    ],
    sectorsMore: 'Secteurs\ncouverts',
    features: [
      { icon: ScanLine,  label: 'Visite 3D',    sub: 'Matterport' },
      { icon: Sparkles,  label: 'Assistant IA', sub: 'Luxedia'    },
      { icon: BarChart2, label: 'Analytics',    sub: '& rapports' },
      { icon: Share2,    label: 'Partage',      sub: 'facile'     },
    ],
  },
  en: {
    eyebrow:    'Immersive intelligence at the service of your brand',
    title:      <>Transform your spaces<br />into intelligent <em style={{ color: GOLD, fontStyle: 'italic' }}>360°</em> experiences</>,
    desc:       <>Give your clients an immersive, interactive experience accessible <strong style={{ color: TEXT_DARK, fontWeight: 500 }}>24/7</strong> — powered by <strong style={{ color: TEXT_DARK, fontWeight: 500 }}>Matterport</strong> 3D and <span style={{ color: GOLD, fontWeight: 500 }}>Luxedia</span> AI.</>,
    cta1:       'Watch a demo',
    cta2:       'Talk about my project',
    stat1sub:   'Leading 3D capture technology',
    stat2sub:   'Conversational artificial intelligence',
    online:     'Online',
    placeholder:'Your question…',
    actions:    ['Quick actions'],
    chatWelcome:'Welcome! I am Luxedia, your AI assistant. How can I help you?',
    chatQ:      ['What are your services?', 'What is the price?', 'Portfolio examples'],
    chatA:      'Starting at $5,900.\nTrial available!',
    quickBtns:  ['Book a test drive', 'Request a price', 'Talk to an advisor', 'Get directions'],
    secteurs: [
      { icon: Car,             label: 'Automotive', sub: 'Dealerships & showrooms' },
      { icon: UtensilsCrossed, label: 'Restaurant', sub: 'Culinary experiences'    },
      { icon: Building2,       label: 'Real Estate', sub: 'Agencies & developers'  },
      { icon: Hotel,           label: 'Hospitality', sub: 'Hotels & accommodations'},
      { icon: ShoppingBag,     label: 'Retail',      sub: 'Stores & boutiques'     },
    ],
    sectorsMore: 'Sectors\ncovered',
    features: [
      { icon: ScanLine,  label: '3D Tour',    sub: 'Matterport' },
      { icon: Sparkles,  label: 'AI Assistant', sub: 'Luxedia'  },
      { icon: BarChart2, label: 'Analytics',  sub: '& reports'  },
      { icon: Share2,    label: 'Sharing',    sub: 'made easy'  },
    ],
  },
}

export default function Hero() {
  const { lang } = useLanguage()
  const c = content[lang]

  return (
    <section style={{ backgroundColor: CREAM, position: 'relative', overflow: 'hidden', paddingTop: '68px', display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: ['radial-gradient(ellipse 600px 400px at 80% 40%, rgba(200,152,26,0.05) 0%, transparent 70%)', 'radial-gradient(ellipse 300px 300px at 8% 70%, rgba(200,152,26,0.03) 0%, transparent 65%)'].join(', ') }} />

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 56px', position: 'relative', zIndex: 2, minHeight: 'calc(100vh - 68px)' }}>

        {/* Colonne gauche */}
        <div style={{ padding: '64px 52px 64px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: `1px solid ${BORDER_LIGHT}` }}>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <Sparkles size={12} style={{ color: GOLD, flexShrink: 0 }} />
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD }}>{c.eyebrow}</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.15 }} style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.6rem, 3.2vw, 3.6rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: TEXT_DARK, marginBottom: '22px' }}>
            {c.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55, delay: 0.28 }} style={{ fontSize: '14px', lineHeight: 1.82, color: TEXT_SOFT, marginBottom: '28px', fontWeight: 300 }}>
            {c.desc}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.34 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '28px' }}>
            {c.features.map((f) => (
              <div key={f.label} className="feature-pill" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', textAlign: 'center', background: 'rgba(255,255,255,0.75)', border: `1px solid ${BORDER_LIGHT}`, borderRadius: '10px', padding: '12px 6px', transition: 'all 0.2s ease' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.icon size={14} style={{ color: GOLD, strokeWidth: 1.5 }} />
                </div>
                <div>
                  <p style={{ fontSize: '9.5px', fontWeight: 700, color: TEXT_DARK, margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.label}</p>
                  <p style={{ fontSize: '9px', color: TEXT_MUTED, margin: '1px 0 0', fontWeight: 300 }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.42 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link href="/embed/mercedes-voiture-1" className="hero-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', backgroundColor: GOLD, color: DARK, borderRadius: '8px', padding: '13px 26px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.25s ease' }}>
              <Play size={10} style={{ fill: 'currentColor', flexShrink: 0 }} />
              {c.cta1}
            </Link>
            <Link href="#contact" className="hero-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: `1.5px solid ${BORDER_LIGHT}`, borderRadius: '8px', padding: '12px 20px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_MID, textDecoration: 'none', transition: 'all 0.25s ease' }}>
              {c.cta2}
              <span className="hero-arrow" style={{ color: GOLD, fontSize: '14px', display: 'inline-block', transition: 'transform 0.2s ease' }}>→</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.75)', border: `1px solid ${BORDER_LIGHT}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderRight: `1px solid ${BORDER_LIGHT}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 500, color: TEXT_DARK, lineHeight: 1 }}>80%</span>
                <span style={{ fontSize: '8.5px', fontWeight: 700, color: TEXT_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Matterport</span>
              </div>
              <p style={{ fontSize: '9px', color: TEXT_MUTED, margin: 0, fontWeight: 300 }}>{c.stat1sub}</p>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 500, color: GOLD, lineHeight: 1 }}>20%</span>
                <span style={{ fontSize: '8.5px', fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Luxedia</span>
              </div>
              <p style={{ fontSize: '9px', color: TEXT_MUTED, margin: 0, fontWeight: 300 }}>{c.stat2sub}</p>
            </div>
          </motion.div>
        </div>

        {/* Colonne droite — mockup */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ padding: '40px 0 40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: '580px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', background: '#0C0B09', boxShadow: ['0 40px 90px rgba(0,0,0,0.18)', '0 8px 24px rgba(0,0,0,0.1)', '0 2px 0 rgba(255,255,255,0.5) inset'].join(', ') }}>

            <div style={{ background: '#131210', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#FF5F57', '#FFBD2E', '#28C840'].map(c2 => <div key={c2} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c2 }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '4px 10px', fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em' }}>
                signature3dia.com/embed/mercedes-cle53-amg
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="status-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                <span style={{ fontSize: '9px', color: '#4ade80' }}>{c.online}</span>
              </div>
            </div>

            <div style={{ display: 'flex', height: '360px' }}>
              <div style={{ flex: '0 0 65%', position: 'relative', overflow: 'hidden' }}>
                <Image src="/voiture.png" alt="Mercedes CLE 53 AMG" fill priority sizes="40vw" style={{ objectFit: 'cover', objectPosition: '55% center' }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 45%, rgba(0,0,0,0.2) 100%)' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5px', color: 'rgba(255,255,255,0.82)', letterSpacing: '0.05em' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: GOLD, display: 'inline-block' }} />
                  Mercedes CLE 53 AMG · G 2026
                </div>
                <div className="hotspot-pulse" style={{ position: 'absolute', top: '54%', left: '44%', zIndex: 2, transform: 'translate(-50%,-50%)', width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid rgba(200,152,26,0.8)', background: 'rgba(200,152,26,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: GOLD }} />
                </div>
              </div>

              <div style={{ flex: '0 0 35%', background: '#0F0E0C', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${GOLD} 0%, #7A5608 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={11} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#fff', margin: 0 }}>Luxedia</p>
                    <p style={{ fontSize: '8px', color: '#4ade80', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                      {c.online}
                    </p>
                  </div>
                </div>

                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
                  <div style={{ background: '#1B1A17', borderRadius: '8px 8px 8px 2px', padding: '8px 10px', fontSize: '9.5px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
                    {c.chatWelcome}
                  </div>
                  {c.chatQ.map(q => (
                    <div key={q} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '5px', padding: '6px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8.5px', color: 'rgba(255,255,255,0.36)', cursor: 'pointer' }}>
                      {q}
                      <span style={{ color: GOLD, fontSize: '10px', flexShrink: 0, marginLeft: '3px' }}>›</span>
                    </div>
                  ))}
                  <div style={{ background: '#1B1A17', borderRadius: '8px 8px 8px 2px', padding: '8px 10px', fontSize: '9.5px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
                    {c.chatA}
                  </div>
                </div>

                <div style={{ padding: '7px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '5px' }}>{c.actions[0]}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {c.quickBtns.map(a => (
                      <div key={a} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', padding: '5px 6px', fontSize: '7.5px', color: 'rgba(255,255,255,0.38)', textAlign: 'center', cursor: 'pointer' }}>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '7px 10px 10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '7px', padding: '7px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.18)', flex: 1 }}>{c.placeholder}</span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5h7M4.5 1.5L8 4.5l-3.5 3" stroke="#0C0B09" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#090806', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '9px', fontWeight: 500, color: 'rgba(200,152,26,0.55)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Signature 3D IA</span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.14)', letterSpacing: '0.1em' }}>Matterport · Luxedia IA · QR</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre secteurs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.68 }} style={{ background: '#ffffff', borderTop: `1px solid ${BORDER_LIGHT}`, position: 'relative', zIndex: 2 }}>
        <div className="secteurs-bar" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 56px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto' }}>
          {c.secteurs.map((s) => (
            <div key={s.label} className="secteur-item" style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRight: `1px solid ${BORDER_LIGHT}`, transition: 'background 0.2s ease', cursor: 'default' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0, background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={15} style={{ color: GOLD, strokeWidth: 1.4 }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: TEXT_DARK, margin: 0, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontSize: '9.5px', color: TEXT_MUTED, margin: '2px 0 0', fontWeight: 300 }}>{s.sub}</p>
              </div>
            </div>
          ))}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.2rem', fontWeight: 400, color: GOLD, lineHeight: 1, margin: 0 }}>+5</p>
            <p style={{ fontSize: '8.5px', color: TEXT_MUTED, marginTop: '3px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'pre-line' }}>{c.sectorsMore}</p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .feature-pill:hover { border-color: ${GOLD_BORDER} !important; background: #fff !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.07); }
        .hero-cta-primary:hover { background-color: #B8820E !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,152,26,0.35) !important; }
        .hero-cta-secondary:hover { background: rgba(255,255,255,0.9) !important; border-color: ${GOLD_BORDER} !important; color: ${TEXT_DARK} !important; }
        .hero-cta-secondary:hover .hero-arrow { transform: translateX(4px); }
        .secteur-item:hover { background: #F8F5EF !important; }
        @keyframes hotspot-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,152,26,0.5); } 50% { box-shadow: 0 0 0 10px rgba(200,152,26,0); } }
        .hotspot-pulse { animation: hotspot-ring 2.6s ease-in-out infinite; }
        @keyframes status-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .status-pulse { animation: status-blink 2s ease-in-out infinite; }
        @media (max-width: 1024px) { .hero-grid { grid-template-columns: 1fr !important; padding: 40px 32px !important; } .hero-grid > div:first-child { border-right: none !important; padding: 0 0 40px 0 !important; } .hero-grid > div:last-child { padding: 0 !important; } }
        @media (max-width: 640px) { .hero-grid { padding: 32px 20px !important; } .secteurs-bar { grid-template-columns: repeat(2, 1fr) !important; padding: 0 20px !important; } }
        @media (max-width: 420px) { .secteurs-bar { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
