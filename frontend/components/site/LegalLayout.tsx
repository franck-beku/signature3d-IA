/**
 * LegalLayout — Mise en page partagée des pages légales
 * Charte V2 : fond crème lumineux, Cormorant, prose lisible, date de mise à jour.
 * Utilisé par /confidentialite, /conditions, /cookies.
 */

'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'

const GOLD = '#C8A45D'
const CREAM = '#F7F5F2'
const INK = '#101010'

interface LegalLayoutProps {
  eyebrow: string
  title: string
  updatedLabel: string   // ex. "Dernière mise à jour"
  updatedDate: string    // ex. "21 juin 2026"
  children: React.ReactNode
}

export default function LegalLayout({ eyebrow, title, updatedLabel, updatedDate, children }: LegalLayoutProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, ${CREAM} 60%, #F1EEE8 100%)`,
      }}
    >
      <Navbar />

      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '150px', paddingBottom: '96px' }}>
        {/* halo doré ambiant */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(45% 26% at 50% 8%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="container-main" style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: '48px' }}
          >
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.32em', color: GOLD, marginBottom: '16px' }}>
              {eyebrow}
            </span>
            <h1 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              color: INK,
              letterSpacing: '-0.01em',
              margin: 0,
            }}>
              {title}
            </h1>
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#9A8E78', letterSpacing: '0.04em' }}>
              {updatedLabel} : {updatedDate}
            </p>
            <div style={{ marginTop: '28px', height: '1px', background: 'linear-gradient(to right, rgba(200,164,93,0.5), transparent)' }} />
          </motion.div>

          {/* Contenu */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="legal-prose"
          >
            {children}
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        .legal-prose h2 {
          font-family: var(--font-cormorant), serif;
          font-size: 1.6rem;
          font-weight: 500;
          color: ${INK};
          margin: 44px 0 14px;
          letter-spacing: -0.01em;
        }
        .legal-prose h3 {
          font-size: 1rem;
          font-weight: 600;
          color: ${INK};
          margin: 28px 0 10px;
        }
        .legal-prose p {
          font-size: 0.97rem;
          line-height: 1.8;
          color: #4A4234;
          margin: 0 0 16px;
        }
        .legal-prose ul {
          margin: 0 0 16px;
          padding-left: 22px;
        }
        .legal-prose li {
          font-size: 0.97rem;
          line-height: 1.8;
          color: #4A4234;
          margin-bottom: 6px;
        }
        .legal-prose a {
          color: ${GOLD};
          text-decoration: none;
          border-bottom: 1px solid rgba(200,164,93,0.3);
        }
        .legal-prose a:hover { border-bottom-color: ${GOLD}; }
        .legal-prose strong { color: ${INK}; font-weight: 600; }
        .legal-prose .todo {
          background: rgba(200,164,93,0.1);
          border: 1px dashed rgba(200,164,93,0.5);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 0.85rem;
          color: #8A6A1E;
          font-weight: 600;
        }
        .legal-prose .legal-note {
          margin-top: 48px;
          padding: 18px 22px;
          background: rgba(255,255,255,0.6);
          border: 1px solid #E8E2D4;
          border-radius: 12px;
          font-size: 0.85rem;
          color: #6B6458;
          line-height: 1.7;
        }
      `}</style>
    </main>
  )
}
