'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const sectionRef = useRef<HTMLElement>(null);

  // Légère parallaxe : le bloc texte monte doucement au scroll.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['18px', '-18px']);

  // Apparition séquencée des éléments au scroll.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label={t('Notre vision', 'Our vision')}
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
          y,
          position: 'relative',
          zIndex: 1,
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '110px 32px',       // ← PADDING réduit (était 150px)
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
            gridTemplateColumns: '1.25fr 1px 0.9fr', // gauche / séparateur / droite
            gap: '72px',
            alignItems: 'center',
          }}
          className="manifeste-grid"
        >
          {/* ── Colonne gauche : la vision (grand titre Cormorant) ── */}
          <motion.div variants={item}>
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
              {t('Notre vision', 'Our vision')}
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontWeight: 400,
                color: INK,
                lineHeight: 1.08,                          // ← resserré
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2.4rem, 4.2vw, 4.2rem)',  // ← titre réduit (était 5.2rem)
                margin: 0,
                maxWidth: '720px',                         // ← largeur resserrée
              }}
            >
              {t('Nous ne créons pas simplement des visites.', 'We do not simply create tours.')}
              <br />
              {t('Nous ', 'We ')}
              <span style={{ color: GOLD }}>
                {t('transformons des espaces', 'transform spaces')}
              </span>
              <br />
              {t(
                'en expériences immersives qui captivent, informent et convertissent.',
                'into immersive experiences that captivate, inform and convert.'
              )}
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
          <motion.div variants={item} style={{ maxWidth: '390px' }}>
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
            padding: 90px 24px !important;
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
            padding: 72px 22px !important;
          }
        }
      `}</style>
    </section>
  );
}
