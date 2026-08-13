'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

export default function OffresVedettes() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: reduceMotion ? 0 : 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label={t('Nos offres', 'Our offers')}
      style={{
        backgroundColor: colors.white,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '128px 32px' }} className="ov-wrap">
        {/* ── Chantier 9 — déclaration éditoriale, pas un aperçu du catalogue.
             Aucun nom d'offre, aucune carte : la page /services reste le seul endroit
             où la gamme est révélée. ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          className="ov-declaration"
        >
          <motion.p variants={item} className="ov-label">
            {t('Nos offres', 'Our offers')}
          </motion.p>

          <motion.div variants={item} className="ov-rule" aria-hidden="true" />

          <div className="ov-content">
            <motion.h2 variants={item} className="ov-headline">
              {t('Chaque projet mérite sa propre expérience.', 'Every project deserves its own experience.')}
            </motion.h2>

            <motion.p variants={item} className="ov-sub">
              {t(
                'Nos solutions s’adaptent à votre espace, à vos objectifs et à vos besoins.',
                'Our solutions adapt to your space, your goals, and your needs.'
              )}
            </motion.p>

            <motion.div variants={item}>
              <Link href="/services" className="ov-cta">
                {t('Découvrir toutes nos offres', 'Discover all our offers')}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .ov-declaration {
          display: grid;
          grid-template-columns: minmax(160px, 30%) 1px 1fr;
          column-gap: 24px;
        }

        .ov-label {
          grid-column: 1;
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
        }

        .ov-rule {
          grid-column: 2;
          width: 1px;
          background-color: rgba(200,164,93,0.35);
        }

        .ov-content {
          grid-column: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }

        .ov-headline {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.6rem, 4vw, 4rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
          max-width: 680px;
          text-align: left;
        }

        .ov-sub {
          font-size: 16px;
          line-height: 1.75;
          color: ${colors.muted};
          font-weight: 300;
          margin: 0;
          max-width: 480px;
        }

        .ov-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: ${colors.ink};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(200,164,93,0.4);
          transition: border-color 0.3s ease, color 0.3s ease;
        }

        .ov-cta svg {
          transition: transform 0.25s ease;
        }

        .ov-cta:hover {
          border-color: ${colors.gold};
          color: ${colors.gold};
        }

        .ov-cta:hover svg {
          transform: translateX(3px);
        }

        .ov-cta:focus-visible {
          outline: 2px solid ${colors.gold};
          outline-offset: 4px;
          border-radius: 2px;
        }

        @media (max-width: 760px) {
          .ov-wrap {
            padding: 110px 24px !important;
          }

          .ov-declaration {
            grid-template-columns: 1fr;
            column-gap: 0;
          }

          .ov-label,
          .ov-content {
            grid-column: 1;
          }

          .ov-content {
            margin-top: 20px;
          }

          .ov-rule {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
