'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Luxedia — Acte 4 du film.
 *
 * Règle d'or : Luxedia PRÉSENTE le personnage IA. Le dialogue jouable est
 * réservé à la démo 80/20 (Écran 5). Ici : aucune interface de chat, aucun
 * avatar, aucune fenêtre SaaS. On suggère une PRÉSENCE, on ne la simule pas.
 *
 * Direction :
 *  - fond charbon (continuité du film)
 *  - gauche : texte éditorial qui apparaît ligne par ligne
 *  - droite : un orbe doré qui respire lentement + une bulle unique de question
 *    qui apparaît / s'efface en rotation (sectorielle, pour montrer l'adaptation)
 *  - eyebrow « Présence numérique » (écho à « Notre conviction » / « Nos univers »)
 */

const GOLD = '#C8A45D';
const CHARBON = '#0B0B0B';

export default function Luxedia() {
  const { t, lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Questions de visiteurs, par secteur — montrent que Luxedia s'adapte.
  const QUESTIONS = lang === 'fr'
    ? [
        'Quelle est la motorisation ?',
        'Puis-je visiter cette propriété à distance ?',
        'Quelle est la superficie ?',
        'Y a-t-il une terrasse ?',
        'Quels sont vos horaires ?',
      ]
    : [
        'What engine does it have?',
        'Can I tour this property remotely?',
        'What is the floor area?',
        'Is there a terrace?',
        'What are your opening hours?',
      ];

  const [qIndex, setQIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Rotation des bulles toutes les ~5,5 s.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setQIndex((i) => (i + 1) % QUESTIONS.length);
    }, 5500);
    return () => clearInterval(id);
  }, [reduceMotion, QUESTIONS.length]);

  // Légère parallaxe de l'orbe.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Luxedia"
      style={{
        position: 'relative',
        background:
          'radial-gradient(circle at 72% 50%, rgba(200,164,93,0.10) 0%, rgba(200,164,93,0.03) 32%, rgba(11,11,11,1) 64%), #0B0B0B',
        overflow: 'hidden',
      }}
    >
      <div
        className="luxedia-grid"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '64px',
          alignItems: 'center',
        }}
      >
        {/* ── Colonne gauche : texte éditorial ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p
            variants={item}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(200,164,93,0.85)',
              marginBottom: '32px',
            }}
          >
            {t('Présence numérique', 'Digital presence')}
          </motion.p>

          <motion.h2
            variants={item}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              color: '#F7F5F2',
              lineHeight: 1.1,
              fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
              margin: '0 0 8px',
              letterSpacing: '0.01em',
            }}
          >
            Luxedia
          </motion.h2>

          <motion.p
            variants={item}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              fontStyle: 'italic',
              color: GOLD,
              fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)',
              lineHeight: 1.35,
              margin: '0 0 40px',
            }}
          >
            {t(
              'L’intelligence qui donne une voix à vos espaces.',
              'The intelligence that gives your spaces a voice.'
            )}
          </motion.p>

          {/* Trois temps courts */}
          <motion.div variants={item} style={{ marginBottom: '32px' }}>
            <p
              style={{
                fontSize: 'clamp(16px, 1.8vw, 19px)',
                fontWeight: 300,
                lineHeight: 2,
                color: 'rgba(247,245,242,0.92)',
                margin: 0,
              }}
            >
              {t('Elle répond.', 'She answers.')}<br />
              {t('Elle oriente.', 'She guides.')}<br />
              {t('Elle accompagne.', 'She accompanies.')}
            </p>
          </motion.div>

          <motion.p
            variants={item}
            style={{
              maxWidth: '440px',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              fontWeight: 300,
              lineHeight: 1.85,
              color: 'rgba(247,245,242,0.6)',
              margin: 0,
            }}
          >
            {t(
              'Un ambassadeur numérique disponible à toute heure, sur chaque visite immersive. Elle ne remplace pas l’expérience — elle l’enrichit.',
              'A digital ambassador available at any hour, on every immersive visit. She does not replace the experience — she enriches it.'
            )}
          </motion.p>
        </motion.div>

        {/* ── Colonne droite : orbe vivant + bulle ── */}
        <motion.div
          style={{ y: orbY }}
          className="luxedia-orb-wrap"
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '560px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Halo extérieur très grand et diffus — c'est LUI qu'on voit en premier */}
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.45, 0.7, 0.45] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: '560px',
                height: '560px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(200,164,93,0.16) 0%, rgba(200,164,93,0.05) 40%, rgba(200,164,93,0) 70%)',
              }}
            />

            {/* Anneau intermédiaire très discret */}
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? {} : { scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                border: '1px solid rgba(200,164,93,0.15)',
              }}
            />

            {/* Noyau lumineux, petit et intense */}
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 30%, rgba(247,224,180,0.95) 0%, rgba(200,164,93,0.9) 45%, rgba(150,90,15,0.6) 100%)',
                boxShadow: '0 0 60px rgba(200,164,93,0.6)',
              }}
            />

            {/* Bulle unique en rotation — remontée près de l'orbe (flottement) */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(50% - 130px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'max-content',
                maxWidth: '88%',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(200,164,93,0.35)',
                    borderRadius: '999px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: 300,
                    color: '#F7F5F2',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {QUESTIONS[qIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Identité discrète sous l'orbe + ligne de sens */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: 'max-content',
                maxWidth: '90%',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,245,242,0.5)',
                }}
              >
                <motion.span
                  aria-hidden="true"
                  animate={reduceMotion ? {} : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: GOLD,
                    boxShadow: `0 0 8px ${GOLD}`,
                    display: 'inline-block',
                  }}
                />
                {t('Présence active', 'Active presence')}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: 'rgba(247,245,242,0.4)',
                }}
              >
                {t(
                  'Elle répond à chaque visiteur, dans chaque univers.',
                  'She answers every visitor, in every world.'
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .luxedia-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 110px 24px !important;
          }
          .luxedia-orb-wrap { order: -1; }
        }
      `}</style>
    </section>
  );
}
