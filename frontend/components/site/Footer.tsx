/**
 * Footer — Signature 3D IA
 * Version: 3.0 — Multilingue FR/EN
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

const GOLD = '#C8981A'

const content = {
  fr: {
    desc:    'Transformez vos espaces physiques en expériences 3D intelligentes — disponibles 24/7.',
    tagline: 'Immersive Intelligence · Québec',
    nav:     'Navigation',
    sectors: 'Secteurs',
    contact: 'Contact',
    demo:    'Demander une démo',
    rights:  `© ${new Date().getFullYear()} Signature 3D IA. Tous droits réservés.`,
    navLinks: [
      { href: '/#services',    label: 'Services'          },
      { href: '/realisations', label: 'Réalisations'      },
      { href: '/#resultats',   label: 'Résultats'         },
      { href: '/#comment',     label: 'Comment ça marche' },
    ],
    sectorLinks: [
      { href: '/realisations', label: 'Automobile' },
      { href: '/realisations', label: 'Restaurant' },
      { href: '/realisations', label: 'Immobilier' },
      { href: '/realisations', label: 'Hôtellerie' },
      { href: '/realisations', label: 'Commerce'   },
    ],
    legalLinks: [
      { href: '/confidentialite', label: 'Confidentialité' },
      { href: '/conditions',      label: 'Conditions'      },
      { href: '/#contact',        label: 'Contact'         },
    ],
  },
  en: {
    desc:    'Transform your physical spaces into intelligent 3D experiences — available 24/7.',
    tagline: 'Immersive Intelligence · Québec',
    nav:     'Navigation',
    sectors: 'Sectors',
    contact: 'Contact',
    demo:    'Request a demo',
    rights:  `© ${new Date().getFullYear()} Signature 3D IA. All rights reserved.`,
    navLinks: [
      { href: '/#services',    label: 'Services'    },
      { href: '/realisations', label: 'Portfolio'   },
      { href: '/#resultats',   label: 'Results'     },
      { href: '/#comment',     label: 'How it works'},
    ],
    sectorLinks: [
      { href: '/realisations', label: 'Automotive'  },
      { href: '/realisations', label: 'Restaurant'  },
      { href: '/realisations', label: 'Real Estate' },
      { href: '/realisations', label: 'Hospitality' },
      { href: '/realisations', label: 'Retail'      },
    ],
    legalLinks: [
      { href: '/confidentialite', label: 'Privacy'  },
      { href: '/conditions',      label: 'Terms'    },
      { href: '/#contact',        label: 'Contact'  },
    ],
  },
}

export default function Footer() {
  const { lang } = useLanguage()
  const c = content[lang]

  return (
    <footer style={{ backgroundColor: '#0C0C0A', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '64px', paddingBottom: '36px' }}>
      <div className="container-main">

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '48px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="footer-grid">

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
              <Image src="/logo-dark.png" alt="Signature 3D IA" width={160} height={52} style={{ height: '40px', width: 'auto', opacity: 0.85 }} />
            </Link>
            <p style={{ fontSize: '12px', lineHeight: 1.8, color: 'rgba(255,255,255,0.35)', fontWeight: 300, maxWidth: '240px', marginBottom: '20px' }}>{c.desc}</p>
            <p style={{ fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(200,152,26,0.5)' }}>{c.tagline}</p>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.nav}</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {c.navLinks.map((link) => (
                <Link key={link.label} href={link.href} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Secteurs */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.sectors}</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {c.sectorLinks.map((link) => (
                <Link key={link.label} href={link.href} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.contact}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <a href="mailto:info@signature3dia.com" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">info@signature3dia.com</a>
              <a href="tel:+18190000000" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">+1 (819) 000-0000</a>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 300 }}>Trois-Rivières, Québec</p>
            </div>
            <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '6px', padding: '9px 16px', fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.25s ease' }} className="footer-cta">
              {c.demo}
              <span style={{ color: GOLD }}>→</span>
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '24px' }} className="footer-bottom">
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>{c.rights}</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {c.legalLinks.map((link) => (
              <Link key={link.label} href={link.href} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 300 }} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: ${GOLD} !important; }
        .footer-cta:hover  { background-color: ${GOLD} !important; border-color: ${GOLD} !important; color: #000 !important; }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; } }
        @media (max-width: 640px)  { .footer-grid { grid-template-columns: 1fr !important; } .footer-bottom { flex-direction: column !important; text-align: center !important; } }
      `}</style>
    </footer>
  )
}
