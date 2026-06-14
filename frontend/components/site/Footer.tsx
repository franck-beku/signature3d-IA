/**
 * Footer — Signature Immersion
 * Version: 4.0 — Logo complet + Univers (ambition) / Explorer / Réalisations récentes (dynamique) / Contact
 *                Charbon #0B0B0B + Or #D4881E + pages légales (Confidentialité / CGU / Cookies)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { projectsApi, type ProjectCardDto } from '@/lib/api'

const GOLD = '#D4881E'

const content = {
  fr: {
    desc:    'Nous transformons vos espaces en expériences immersives intelligentes — 3D, 360° et IA.',
    tagline: 'Expériences immersives · Québec',
    universe: 'Nos univers',
    explore:  'Explorer',
    recent:   'Réalisations récentes',
    contact:  'Contact',
    demo:     'Demander une démo',
    rights:   `© ${new Date().getFullYear()} Signature Immersion. Tous droits réservés.`,
    universes: ['Automobile', 'Immobilier', 'Restaurant', 'Hôtellerie', 'Commerce'],
    exploreLinks: [
      { href: '/services',          label: 'Services'          },
      { href: '/realisations',      label: 'Réalisations'      },
      { href: '/comment-ca-marche', label: 'Comment ça marche' },
      { href: '/faq',               label: 'FAQ'               },
      { href: '/contact',           label: 'Contact'           },
    ],
    legalLinks: [
      { href: '/confidentialite', label: 'Confidentialité' },
      { href: '/cgu',             label: 'CGU'             },
      { href: '/cookies',         label: 'Cookies'         },
    ],
    city: 'Trois-Rivières, Québec',
  },
  en: {
    desc:    'We transform your spaces into intelligent immersive experiences — 3D, 360° and AI.',
    tagline: 'Immersive experiences · Québec',
    universe: 'Our universes',
    explore:  'Explore',
    recent:   'Recent work',
    contact:  'Contact',
    demo:     'Request a demo',
    rights:   `© ${new Date().getFullYear()} Signature Immersion. All rights reserved.`,
    universes: ['Automotive', 'Real Estate', 'Restaurant', 'Hospitality', 'Retail'],
    exploreLinks: [
      { href: '/services',          label: 'Services'    },
      { href: '/realisations',      label: 'Portfolio'   },
      { href: '/comment-ca-marche', label: 'How it works'},
      { href: '/faq',               label: 'FAQ'         },
      { href: '/contact',           label: 'Contact'     },
    ],
    legalLinks: [
      { href: '/confidentialite', label: 'Privacy' },
      { href: '/cgu',             label: 'Terms'   },
      { href: '/cookies',         label: 'Cookies' },
    ],
    city: 'Trois-Rivières, Québec',
  },
}

export default function Footer() {
  const { lang } = useLanguage()
  const c = content[lang]

  // ── Réalisations récentes (dynamique, blindé) ──
  const [recent, setRecent] = useState<ProjectCardDto[]>([])

  useEffect(() => {
    let active = true
    projectsApi
      .getFeatured()
      .then((projects) => {
        if (active && Array.isArray(projects)) setRecent(projects.slice(0, 4))
      })
      .catch(() => { /* silencieux — le footer ne doit jamais casser */ })
    return () => { active = false }
  }, [])

  // On n'affiche la colonne "Réalisations récentes" que s'il y a au moins 2 projets
  const showRecent = recent.length >= 2

  return (
    <footer style={{ backgroundColor: '#0B0B0B', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '64px', paddingBottom: '36px' }}>
      <div className="container-main">

        <div style={{ display: 'grid', gridTemplateColumns: showRecent ? '1.8fr 1fr 1fr 1fr 1fr' : '1.8fr 1fr 1fr 1fr', gap: '40px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="footer-grid">

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
              <Image src="/logo-full.png" alt="Signature Immersion" width={320} height={213} style={{ height: '88px', width: 'auto', opacity: 1 }} />
            </Link>
            <p style={{ fontSize: '12px', lineHeight: 1.8, color: 'rgba(255,255,255,0.35)', fontWeight: 300, maxWidth: '260px', marginBottom: '20px' }}>{c.desc}</p>
            <p style={{ fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(212,136,30,0.5)' }}>{c.tagline}</p>
          </div>

          {/* Nos univers — texte simple (ambition, pas de liens) */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.universe}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {c.universes.map((u) => (
                <span key={u} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{u}</span>
              ))}
            </div>
          </div>

          {/* Explorer — liens de navigation */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.explore}</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {c.exploreLinks.map((link) => (
                <Link key={link.label} href={link.href} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Réalisations récentes — dynamique (masquée si < 2 projets) */}
          {showRecent && (
            <div>
              <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.recent}</p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recent.map((p) => (
                  <Link key={p.id} href={`/embed/${p.slug}`} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">
                    {p.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Contact */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>{c.contact}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <a href="mailto:info@signatureimmersion.ca" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 300 }} className="footer-link">info@signatureimmersion.ca</a>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 300 }}>{c.city}</p>
            </div>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '6px', padding: '9px 16px', fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.25s ease' }} className="footer-cta">
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