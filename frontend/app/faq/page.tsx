/**
 * Page FAQ — Signature Immersion
 * Accordéon premium · multilingue (habillage FR/EN, contenu FR depuis l'API)
 * Branchée sur faqApi.getPublished() · blindée (loading + erreur silencieuse)
 */

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { faqApi, type FaqDto } from '@/lib/api'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'

const GOLD = '#D4881E'

export default function FaqPage() {
  const { t, lang } = useLanguage()

  const [faqs, setFaqs]       = useState<FaqDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId]   = useState<string | null>(null)

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
    <main key={lang} style={{ backgroundColor: '#F7F5F2', minHeight: '100vh' }}>
      <Navbar />

      {/* ── En-tête ── */}
      <section style={{ paddingTop: '160px', paddingBottom: '64px' }}>
        <div className="container-main" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow" style={{ color: GOLD }}>
            {t('Foire aux questions', 'Frequently asked questions')}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 500,
            lineHeight: 1.1,
            color: '#1A1400',
            letterSpacing: '-0.01em',
          }}>
            {t('Questions fréquentes', 'Common questions')}
          </h1>
          <p style={{
            marginTop: '1.25rem',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#5A4E3A',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: 300,
          }}>
            {t(
              "Tout ce qu'il faut savoir sur nos expériences immersives, l'assistant Luxedia et le déroulement d'un projet.",
              'Everything you need to know about our immersive experiences, the Luxedia assistant and how a project unfolds.'
            )}
          </p>
          <div className="section-divider" />
        </div>
      </section>

      {/* ── Accordéon ── */}
      <section style={{ paddingBottom: '96px' }}>
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
              {faqs.map((faq) => {
                const isOpen = openId === faq.id
                return (
                  <div
                    key={faq.id}
                    style={{
                      backgroundColor: isOpen ? '#FFFFFF' : 'transparent',
                      border: `1px solid ${isOpen ? 'rgba(212,136,30,0.35)' : '#E8E2D4'}`,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: isOpen ? '0 12px 40px rgba(0,0,0,0.06)' : 'none',
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
                        fontSize: '1.02rem',
                        fontWeight: 500,
                        color: '#1A1400',
                        lineHeight: 1.45,
                      }}>
                        {faq.question}
                      </span>
                      <span style={{
                        flexShrink: 0,
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOpen ? GOLD : '#8A7A5A',
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
                        fontWeight: 300,
                        maxWidth: '90%',
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="section-dark" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container-main" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 500,
            color: '#F7F5F2',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            {t('Une autre question ?', 'Another question?')}
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(247,245,242,0.6)',
            fontWeight: 300,
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
              backgroundColor: GOLD,
              color: '#0B0B0B',
              borderRadius: '10px',
              padding: '15px 34px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              textDecoration: 'none',
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
        .faq-cta:hover { background-color: #E09420 !important; transform: translateY(-1px); }
      `}</style>
    </main>
  )
}
