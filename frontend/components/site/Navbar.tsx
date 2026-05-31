/**
 * Navbar — Signature 3D IA
 * Version: 4.0 — Multilingue FR/EN via LanguageContext
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const GOLD = '#C8981A'

const navLinks = {
  fr: [
    { label: 'Services',          href: '/#services'    },
    { label: 'Réalisations',      href: '/realisations' },
    { label: 'Résultats',         href: '/#resultats'   },
    { label: 'Comment ça marche', href: '/#comment'     },
    { label: 'Contact',           href: '/#contact'     },
  ],
  en: [
    { label: 'Services',        href: '/#services'    },
    { label: 'Portfolio',       href: '/realisations' },
    { label: 'Results',         href: '/#resultats'   },
    { label: 'How it works',    href: '/#comment'     },
    { label: 'Contact',         href: '/#contact'     },
  ],
}

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const [isOpen,   setIsOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 900) setIsOpen(false) }
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const links = navLinks[lang]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: '#0C0C0A',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    }}>
      <div className="container-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Image src="/logo-dark.png" alt="Signature 3D IA" width={200} height={64} priority style={{ height: '48px', width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-desktop">
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s ease', whiteSpace: 'nowrap' }} className="nav-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }} className="nav-right">

            {/* Switcher FR/EN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['fr', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    fontSize: '10px', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '4px', border: 'none', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    backgroundColor: lang === l ? GOLD : 'transparent',
                    color: lang === l ? '#000' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* CTA */}
            <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', color: '#0C0C0A', borderRadius: '6px', padding: '9px 18px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.25s ease', whiteSpace: 'nowrap' }} className="nav-cta">
              {t('Demander une démo', 'Request a demo')}
              <span style={{ color: GOLD, fontSize: '13px' }}>→</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ display: 'none', width: '38px', height: '38px', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
            className="nav-mobile-btn"
            aria-label="Menu"
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{ overflow: 'hidden', maxHeight: isOpen ? '480px' : '0', transition: 'max-height 0.35s ease', backgroundColor: '#0C0C0A', borderTop: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div className="container-main" style={{ paddingTop: '12px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} style={{ padding: '11px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.2s ease' }} className="mobile-nav-link">
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['fr', 'en'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ fontSize: '10px', fontWeight: 600, padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', backgroundColor: lang === l ? GOLD : 'transparent', color: lang === l ? '#000' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s ease' }}>
                  {l}
                </button>
              ))}
            </div>
            <Link href="/#contact" onClick={() => setIsOpen(false)} style={{ flex: 1, textAlign: 'center', backgroundColor: '#FFFFFF', color: '#0C0C0A', borderRadius: '6px', padding: '11px 20px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              {t('Demander une démo', 'Request a demo')}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .nav-link:hover        { color: rgba(255,255,255,0.9) !important; }
        .nav-cta:hover         { background-color: ${GOLD} !important; color: #000 !important; }
        .mobile-nav-link:hover { color: rgba(255,255,255,0.9) !important; background: rgba(255,255,255,0.03) !important; }
        @media (max-width: 1100px) { .nav-desktop { gap: 24px !important; } }
        @media (max-width: 900px) {
          .nav-desktop    { display: none !important; }
          .nav-right      { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
