'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Manifeste — Acte 2 du film.
 *
 * Rôle : respiration éditoriale entre le Hero (visuel fort) et Nos univers (galerie).
 * Ton : conviction, pas argumentaire. On dit en quoi on croit, pas ce qu'on vend.
 * Direction : fond charbon (continuité du Hero), texte centré, Cormorant serif,
 *             un seul mot en or, apparition au scroll très sobre (pas d'effet tape-à-l'œil).
 *
 * Construction en 3 temps :
 *  1. une accroche brève (eyebrow doré)
 *  2. la conviction principale, en grand, avec UN mot-clé en or
 *  3. une phrase d'ancrage plus discrète qui ramène au concret
 */

const GOLD = '#C8A45D';
const CHARBON = '#0B0B0B';

export default function Manifeste() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Très légère parallaxe du bloc texte : il monte doucement au scroll.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['20px', '-20px']);

  // Animation séquencée : chaque ligne apparaît l'une après l'autre.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } },
  };
  const line = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label={t('Notre conviction', 'Our conviction')}
      style={{
        position: 'relative',
        backgroundColor: CHARBON,
        overflow: 'hidden',
      }}
    >
      {/* Filet doré central très fin, en haut — marque le début de l'acte. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1px',
          height: '64px',
          background: `linear-gradient(to bottom, ${GOLD}, rgba(200,164,93,0))`,
        }}
      />

      <motion.div
        style={{ y }}
        className="manifeste-inner"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '220px 24px 260px',
            textAlign: 'center',
          }}
        >
          {/* 1 — Eyebrow */}
          <motion.p
            variants={line}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(200,164,93,0.85)',
              marginBottom: '40px',
            }}
          >
            {t('Notre conviction', 'Our conviction')}
          </motion.p>

          {/* 2 — Conviction principale */}
          <motion.h2
            variants={line}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              color: '#F7F5F2',
              lineHeight: 1.25,
              letterSpacing: '0.01em',
              fontSize: 'clamp(1.9rem, 4vw, 3.4rem)',
              margin: 0,
            }}
          >
            {t('Un lieu ne se résume pas à des murs.', 'A place is more than walls.')}
            <br />
            {t('Il se ', 'It is meant to be ')}
            <span style={{ color: GOLD, fontStyle: 'italic' }}>
              {t('vit', 'lived')}
            </span>
            {t(' — bien avant qu’on y mette les pieds.', ' — long before you set foot in it.')}
          </motion.h2>

          {/* 3 — Ancrage concret, plus discret */}
          <motion.p
            variants={line}
            style={{
              marginTop: '60px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              fontWeight: 300,
              lineHeight: 1.8,
              color: 'rgba(247,245,242,0.78)',
            }}
          >
            {t(
              'Nous transformons vos espaces en expériences que l’on explore à distance, à toute heure, depuis n’importe quel écran. Le réel, augmenté par l’intelligence artificielle.',
              'We turn your spaces into experiences explored remotely, at any hour, from any screen. The real world, augmented by artificial intelligence.'
            )}
          </motion.p>
        </motion.div>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .manifeste-inner > div { padding-top: 140px !important; padding-bottom: 170px !important; }
        }
      `}</style>
    </section>
  );
}