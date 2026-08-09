/**
 * Page FAQ — Signature Immersion
 * Charte V2 : accordéon premium, Cormorant, fond crème lumineux + halo doré.
 * Multilingue (habillage FR/EN, contenu depuis l'API).
 * Branchée sur faqApi.getPublished() · blindée (loading + erreur silencieuse)
 */

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { faqApi, type FaqDto } from '@/lib/api'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { colors } from '@/config/theme'

export default function FaqPage() {
  const { t, lang } = useLanguage()

  const [faqs, setFaqs] = useState<FaqDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    faqApi
      .getPublished()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setFaqs([...data].sort((a, b) => a.displayOrder - b.displayOrder))
        }
      })
      .catch(() => { /* silencieux — la page ne doit pas casser */ })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <main
      key={lang}
      style={{
        minHeight: '100vh',
        background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, ${colors.cream} 60%, #F1EEE8 100%)`,
      }}
    >
      <Navbar />

      {/* ── En-tête ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '160px', paddingBottom: '64px' }}>
        {/* halo doré ambiant */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(45% 30% at 50% 12%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="container-main" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="section-eyebrow" style={{ color: colors.gold }}
          >
            {t('Foire aux questions', 'Frequently asked questions')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              color: colors.ink,
              letterSpacing: '-0.01em',
            }}
          >
            {t('Questions fréquentes', 'Common questions')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: '1.25rem',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: '#5A4E3A',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontWeight: 400,
            }}
          >
            {t(
              "Tout ce qu'il faut savoir sur nos expériences immersives, l'assistant Luxedia et le déroulement d'un projet.",
              'Everything you need to know about our immersive experiences, the Luxedia assistant and how a project unfolds.'
            )}
          </motion.p>
          <div className="section-divider" />
        </div>
      </section>

      {/* ── Accordéon ── */}
      <section style={{ paddingBottom: '96px', position: 'relative', zIndex: 1 }}>
        <div className="container-main" style={{ maxWidth: '820px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#8A7A5A', fontSize: '0.9rem' }}>
              {t('Chargement…', 'Loading…')}
            </div>
          ) : faqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#8A7A5A', fontSize: '0.95rem' }}>
              {t(
                'Les questions seront bientôt disponibles. Écrivez-nous en attendant.',
                'Questions will be available soon. Reach out in the meantime.'
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, index) => {
                const isOpen = openId === faq.id
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundColor: isOpen ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${isOpen ? 'rgba(200,164,93,0.35)' : '#E8E2D4'}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: isOpen ? '0 16px 44px -18px rgba(0,0,0,0.14)' : 'none',
                    }}
                  >
                    <button
                      onClick={() => toggle(faq.id)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '22px 26px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        color: colors.ink,
                        lineHeight: 1.45,
                      }}>
                        {lang === 'en' ? (faq.questionEn || faq.question) : faq.question}
                      </span>
                      <span style={{
                        flexShrink: 0,
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOpen ? colors.gold : '#8A7A5A',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease, color 0.3s ease',
                        fontSize: '1.4rem',
                        fontWeight: 300,
                        lineHeight: 1,
                      }}>
                        +
                      </span>
                    </button>

                    <div style={{
                      maxHeight: isOpen ? '600px' : '0',
                      opacity: isOpen ? 1 : 0,
                      transition: 'max-height 0.4s ease, opacity 0.3s ease',
                      overflow: 'hidden',
                    }}>
                      <p style={{
                        padding: '0 26px 24px',
                        margin: 0,
                        fontSize: '0.97rem',
                        lineHeight: 1.75,
                        color: '#5A4E3A',
                        fontWeight: 400,
                        maxWidth: '90%',
                      }}>
                        {lang === 'en' ? (faq.answerEn || faq.answer) : faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ backgroundColor: '#0B0B0B', paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container-main" style={{ textAlign: 'center' }}>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              fontWeight: 500,
              color: colors.cream,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {t('Une autre question ?', 'Another question?')}
          </motion.h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(247,245,242,0.6)',
            fontWeight: 400,
            maxWidth: '460px',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            {t(
              'Parlons de votre espace et de la manière de le rendre immersif.',
              'Let\u2019s talk about your space and how to make it immersive.'
            )}
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: colors.gold,
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
            className="faq-cta"
          >
            {t('Demander une démonstration', 'Request a demonstration')}
            <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        .faq-cta:hover { transform: translateY(-1px); box-shadow: 0 22px 48px -16px rgba(200,164,93,0.6) !important; }
      `}</style>
    </main>
  )
}
