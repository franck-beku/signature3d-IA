'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Démo 80/20 — Acte 5 du film. LE PONT.
 *
 * Rôle unique : répondre en 10 secondes à « comment l'immersion et l'IA
 * travaillent-elles ensemble ? ». Ce n'est PAS une démo live, PAS une page
 * Réalisations, PAS une copie de l'embed. C'est une RÉVÉLATION mise en scène.
 *
 * Composition = la proportion elle-même :
 *  - 80% : grand visuel immersif (image fixe Mercedes, encadrée)
 *  - 20% : panneau Luxedia étroit, avec un échange Visiteur → Luxedia qui tourne
 *  - au centre : l'équation 80% Immersion + 20% Intelligence = Signature Immersion
 *  - CTA « Voir une expérience réelle » → /realisations (la preuve)
 *
 * Image fixe (pas d'iframe) : on met en scène la révélation, on ne la fait pas
 * vivre ici — l'expérience vécue, c'est /embed.
 */

const GOLD = '#C8A45D';
const CHARBON = '#0B0B0B';

/* 3 univers : le diaporama prouve que la techno marche partout, pas juste l'auto.
   L'échange Luxedia est SYNCHRONISÉ avec l'univers affiché (adaptation en direct). */
const SLIDES = [
  {
    image: '/assets/univers/auto.jpg',
    labelFr: 'Visite immersive — Automobile',
    labelEn: 'Immersive tour — Automotive',
    qFr: 'Quels modèles sont disponibles ?',
    aFr: 'Plusieurs véhicules sont présentés. Souhaitez-vous comparer leurs motorisations ?',
    qEn: 'Which models are available?',
    aEn: 'Several vehicles are featured. Would you like to compare their engines?',
  },
  {
    image: '/assets/univers/immobilier.jpg',
    labelFr: 'Visite immersive — Immobilier',
    labelEn: 'Immersive tour — Real estate',
    qFr: 'Quelle est la superficie ?',
    aFr: 'Je vous donne les surfaces pièce par pièce, et vous guide dans la visite.',
    qEn: 'What is the floor area?',
    aEn: 'I’ll give you room-by-room areas and guide you through the tour.',
  },
  {
    image: '/assets/univers/resto.jpg',
    labelFr: 'Visite immersive — Restauration',
    labelEn: 'Immersive tour — Restaurant',
    qFr: 'Peut-on réserver une table ?',
    aFr: 'Bien sûr — je vous oriente vers la réservation en un clic.',
    qEn: 'Can we book a table?',
    aEn: 'Of course — I’ll point you to one-click booking.',
  },
];

export default function Demo8020() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  const [idx, setIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Diaporama + échange synchronisés : on change d'univers toutes les 6 s.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const slide = SLIDES[idx];
  const label = lang === 'fr' ? slide.labelFr : slide.labelEn;
  const q = lang === 'fr' ? slide.qFr : slide.qEn;
  const a = lang === 'fr' ? slide.aFr : slide.aEn;

  const fade = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section
      ref={ref}
      aria-label={t('L’expérience 80/20', 'The 80/20 experience')}
      style={{ backgroundColor: CHARBON, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '150px 32px' }}>
        {/* En-tête */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={fade}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(200,164,93,0.85)',
              marginBottom: '24px',
            }}
          >
            {t('L’expérience 80/20', 'The 80/20 experience')}
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              color: '#F7F5F2',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              lineHeight: 1.15,
              margin: '0 auto',
              maxWidth: '18ch',
            }}
          >
            {t(
              'L’immersion attire. L’intelligence accompagne.',
              'Immersion draws them in. Intelligence guides them.'
            )}
          </h2>
        </motion.div>

        {/* Le 80/20 incarné : 80% visuel + 20% Luxedia */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fade}
          className="demo-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '4fr 1.6fr',
            gap: '20px',
            alignItems: 'stretch',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(200,164,93,0.18)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.4)',
          }}
        >
          {/* 80% — Visuel immersif : diaporama 3 univers + Ken Burns */}
          <div
            className="demo-visual"
            style={{
              position: 'relative',
              minHeight: '440px',
              overflow: 'hidden',
              backgroundColor: CHARBON,
            }}
          >
            <AnimatePresence>
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: reduceMotion ? 1 : 1.1 }}
                  transition={{ duration: 7, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${slide.image}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Voile bas pour les labels */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(11,11,11,0.6) 0%, rgba(11,11,11,0) 45%)',
              }}
            />
            {/* Pastille proportion */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                padding: '7px 14px',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(247,245,242,0.9)',
              }}
            >
              {t('80 % · Immersion', '80% · Immersion')}
            </div>
            {/* Label bas — change avec l'univers */}
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'rgba(247,245,242,0.85)',
                }}
              >
                {label}
              </motion.p>
            </AnimatePresence>

            {/* Indicateur de progression : 3 traits */}
            <div style={{ position: 'absolute', bottom: '22px', right: '20px', display: 'flex', gap: '6px' }}>
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === idx ? '22px' : '10px',
                    height: '2px',
                    borderRadius: '2px',
                    backgroundColor: i === idx ? GOLD : 'rgba(247,245,242,0.3)',
                    transition: 'all 0.5s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 20% — Panneau Luxedia */}
          <div
            className="demo-luxedia"
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(22,18,10,0.96), rgba(11,11,11,0.98))',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* En-tête panneau */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <motion.span
                aria-hidden="true"
                animate={reduceMotion ? {} : { opacity: [0.85, 1, 0.85], scale: [1, 1.12, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 30%, rgba(247,224,180,0.95), rgba(200,164,93,0.9))',
                  boxShadow: '0 0 14px rgba(200,164,93,0.6)',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#F7F5F2', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}>
                Luxedia
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(200,164,93,0.8)',
                }}
              >
                {t('20 % · IA', '20% · AI')}
              </span>
            </div>

            {/* Échange Q/R qui tourne */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', minHeight: '180px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  {/* Question visiteur */}
                  <div style={{ alignSelf: 'flex-end', maxWidth: '92%' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(247,245,242,0.35)', textAlign: 'right' }}>
                      {t('Visiteur', 'Visitor')}
                    </p>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px 14px 4px 14px',
                        padding: '11px 14px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: '#F7F5F2',
                      }}
                    >
                      {q}
                    </div>
                  </div>
                  {/* Réponse Luxedia */}
                  <div style={{ alignSelf: 'flex-start', maxWidth: '94%' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,164,93,0.6)' }}>
                      Luxedia
                    </p>
                    <div
                      style={{
                        background: 'rgba(200,164,93,0.14)',
                        border: '1px solid rgba(200,164,93,0.3)',
                        borderRadius: '14px 14px 14px 4px',
                        padding: '11px 14px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: 'rgba(247,245,242,0.92)',
                      }}
                    >
                      {a}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <p
              style={{
                marginTop: '20px',
                fontSize: '11px',
                lineHeight: 1.6,
                color: 'rgba(247,245,242,0.4)',
                textAlign: 'center',
              }}
            >
              {t('Aperçu — l’échange réel est dans l’expérience.', 'Preview — the real exchange lives in the experience.')}
            </p>
          </div>
        </motion.div>

        {/* Équation + CTA */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={fade}
          style={{ textAlign: 'center', marginTop: '56px' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
              fontWeight: 300,
              color: 'rgba(247,245,242,0.85)',
              margin: '0 0 36px',
            }}
          >
            <span style={{ color: '#F7F5F2' }}>{t('80 % immersion', '80% immersion')}</span>
            <span style={{ color: GOLD }}>{'  +  '}</span>
            <span style={{ color: '#F7F5F2' }}>{t('20 % intelligence', '20% intelligence')}</span>
            <span style={{ color: GOLD }}>{'  =  '}</span>
            <span style={{ color: GOLD, fontStyle: 'italic' }}>Signature Immersion</span>
          </p>

          <Link
            href="/realisations"
            className="demo-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: GOLD,
              color: CHARBON,
              borderRadius: '4px',
              padding: '15px 32px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {t('Voir une expérience réelle', 'See a real experience')}
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .demo-cta:hover {
          box-shadow: 0 0 32px rgba(200,164,93,0.45);
          transform: translateY(-2px);
        }
        @media (max-width: 880px) {
          .demo-grid { grid-template-columns: 1fr !important; }
          .demo-visual { min-height: 300px !important; }
        }
      `}</style>
    </section>
  );
}
