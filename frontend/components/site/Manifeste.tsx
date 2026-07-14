'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Manifeste — Acte 2 du film (VERSION CLAIRE V2).
 *
 * Rôle : première respiration claire après le Hero immersif.
 * Direction : fond CRÈME (#F7F5F2), pas de noir. Mise en page éditoriale
 *             en deux colonnes — la vision à gauche, la mission + signature à droite.
 *
 * Place dans l'alternance des 3 niveaux de fond :
 *   Hero (image) → MANIFESTE (crème #F7F5F2) → Nos univers (blanc) → ...
 *
 * Ajustements : titre ramené à 4.2rem max (plus "galerie", moins "zoomé"),
 *               padding vertical réduit à 110px.
 */

const GOLD = '#C8A45D';     // or champagne — accents uniquement
const CREAM = '#F7F5F2';    // fond de la section (niveau "crème")
const INK = '#101010';      // texte principal sombre sur fond clair
const MUTED = '#5E5A52';    // texte secondaire (mission)
const BORDER = '#E7DED0';   // filets haut/bas très discrets

export default function Manifeste() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const h2InView = useInView(h2Ref, { once: true, margin: '-80px' });

  // Légère parallaxe : le bloc texte monte doucement au scroll.
  // (le hook doit toujours être appelé — on neutralise seulement son usage plus bas si reduceMotion)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const yLeft  = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);
  const yRight = useTransform(scrollYProgress, [0, 1], ['20px', '-20px']);

  // Apparition séquencée des éléments au scroll.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.18, delayChildren: reduceMotion ? 0 : 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.25 : 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label={t('Notre manifeste', 'Our manifesto')}
      style={{
        position: 'relative',
        backgroundColor: CREAM,        // ← FOND CRÈME
        color: INK,
        overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Halo doré très léger en fond, pour ne pas avoir un crème totalement plat. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 20%, rgba(200,164,93,0.10) 0%, transparent 32%), radial-gradient(circle at 86% 70%, rgba(200,164,93,0.06) 0%, transparent 34%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
        }}
        className="manifeste-wrap"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.45 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1px 0.9fr', // gauche / séparateur / droite — élargie pour le H2 3-lignes
            gap: '72px',
            alignItems: 'center',
          }}
          className="manifeste-grid"
        >
          {/* ── Colonne gauche : la vision (grand titre Cormorant) ── */}
          <motion.div variants={item} style={reduceMotion ? undefined : { y: yLeft }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.34em',
                textTransform: 'uppercase',
                color: GOLD,            // eyebrow doré (accent)
                marginBottom: '28px',
              }}
            >
              {t('Notre manifeste', 'Our manifesto')}
            </p>

            <h2
              ref={h2Ref}
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontWeight: 400,
                color: INK,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(1.4rem, 1.8vw, 1.6rem)',
                margin: 0,
                maxWidth: '720px',
              }}
            >
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={reduceMotion ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: 'inset(100% 0 0 0)' }}
                  animate={h2InView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0 }}
                >
                  {t('Nous ne créons pas simplement des visites.', 'We do not simply create tours.')}
                </motion.span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={reduceMotion ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: 'inset(100% 0 0 0)' }}
                  animate={h2InView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.14 }}
                >
                  {t('Nous ', 'We ')}
                  <span style={{ color: GOLD }}>
                    {t('transformons des espaces', 'transform spaces')}
                  </span>
                </motion.span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={reduceMotion ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: 'inset(100% 0 0 0)' }}
                  animate={h2InView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.28 }}
                >
                  {t(
                    'en expériences immersives qui captivent, informent et convertissent.',
                    'into immersive experiences that captivate, inform and convert.'
                  )}
                </motion.span>
              </span>
            </h2>
          </motion.div>

          {/* ── Séparateur vertical doré (devient horizontal en mobile) ── */}
          <motion.div
            variants={item}
            aria-hidden="true"
            style={{
              width: '1px',
              height: '320px',
              background:
                'linear-gradient(to bottom, transparent, rgba(200,164,93,0.55), transparent)',
            }}
            className="manifeste-separator"
          />

          {/* ── Colonne droite : la mission + signature ── */}
          <motion.div variants={item} style={reduceMotion ? { maxWidth: '390px' } : { maxWidth: '390px', y: yRight }}>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.85,
                color: MUTED,
                margin: 0,
              }}
            >
              {t(
                'Chaque espace possède une histoire. Notre mission est de la révéler avec justesse, beauté et technologie.',
                'Every space has a story. Our mission is to reveal it with precision, beauty and technology.'
              )}
            </p>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.85,
                color: MUTED,
                marginTop: '34px',
              }}
            >
              {t(
                'Pour que vos visiteurs ne se contentent pas de voir, mais ressentent, comprennent et passent à l’action.',
                'So your visitors do not merely look, but feel, understand and take action.'
              )}
            </p>

            {/* Signature manuscrite (mot "Signature" en Cormorant italique doré) */}
            <div
              style={{
                marginTop: '42px',
                color: GOLD,
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontSize: '2.5rem',
                lineHeight: 1,
              }}
            >
              Signature
            </div>

            <p
              style={{
                marginTop: '14px',
                fontSize: '13px',
                color: INK,
              }}
            >
              {t("L’équipe Signature Immersion", 'The Signature Immersion team')}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Responsive : en mobile, la grille passe en une seule colonne
          et le séparateur vertical devient une ligne horizontale. */}
      <style>{`
        @media (max-width: 900px) {
          .manifeste-wrap {
            padding: 120px 24px !important;
          }
          .manifeste-grid {
            grid-template-columns: 1fr !important;
            gap: 44px !important;
          }
          .manifeste-separator {
            width: 100% !important;
            height: 1px !important;
            background: linear-gradient(to right, transparent, rgba(200,164,93,0.55), transparent) !important;
          }
        }
        @media (max-width: 640px) {
          .manifeste-wrap {
            padding: 96px 22px !important;
          }
        }
      `}</style>
    </section>
  );
}
