'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';
import { SHOW_LUXEDIA } from './Luxedia';

const BENEFITS = [
  { key: 'found', fr: 'Trouvé directement sur Google', en: 'Found directly on Google' },
  { key: 'explored', fr: 'Exploré avant même la visite', en: 'Explored before the visit' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function StreetView() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label={t('Google Street View', 'Google Street View')}
      style={{
        backgroundColor: colors.cream,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '150px 32px' }} className="sv-wrap">
        <div className="sv-layout">
          {/* Visuel — google.png, asset fixe fourni pour cette section (pas de dépendance Matterport) */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={container}
            className="sv-visual"
          >
            <motion.div variants={item}>
              {/* google.png porte déjà toute la direction artistique (identité Street View,
                  fil, cartographie, repère, lueur) — le panneau n'anime plus que lui-même,
                  aucun élément graphique CSS ne se superpose à l'image. */}
              <motion.div
                className="sv-panorama"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src="/google.png"
                  alt={t(
                    "Illustration : votre espace immersif diffusé sur Google Street View",
                    'Illustration: your immersive space published on Google Street View'
                  )}
                  fill
                  sizes="(min-width: 960px) 660px, 90vw"
                  style={{ objectFit: 'contain' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Texte — eyebrow / titre / paragraphe (inchangé) */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={container}
            className="sv-text"
          >
            <motion.p variants={item} className="sv-label">
              {t('Google Street View', 'Google Street View')}
            </motion.p>
            <motion.h2 variants={item} className="sv-title">
              {t('Votre espace, visible bien ', 'Your space, visible far ')}
              <span>{t('au-delà', 'beyond')}</span>
              {t(' de votre site.', ' your website.')}
            </motion.h2>
            <motion.p variants={item} className="sv-lead">
              {t(
                'Votre expérience immersive peut aussi vivre là où vos visiteurs vous cherchent déjà — sur Google, grâce à l’intégration Street View.',
                'Your immersive experience can also live where your visitors are already looking for you — on Google, thanks to Street View integration.'
              )}
            </motion.p>
          </motion.div>

          {/* Bénéfices + CTA (inchangés) */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={container}
            className="sv-side"
          >
            <ul className="sv-benefits">
              {BENEFITS.map((b, i) => (
                <motion.li variants={item} key={b.key} className="sv-benefit">
                  <span className="sv-benefit-num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{t(b.fr, b.en)}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a variants={item} href="/contact" className="sv-cta">
              {t('En discuter avec notre équipe', 'Discuss it with our team')} <ArrowRight size={14} />
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* ── Fils dorés en écho — continuité Luxedia → Street View → CommentCaMarche.
           Indépendants : aucun état partagé, alignement (left:50%) garanti par la
           géométrie des sections pleine largeur, exactement comme Luxedia.tsx et
           CommentCaMarche.tsx le font déjà entre elles. Distincts du fil doré visible
           DANS google.png (interne à l'image, non lié à ces deux-ci).
           Le fil du haut n'a de sens que s'il y a bien un fil Luxedia juste au-dessus
           pour le rejoindre : masqué avec Luxedia (SHOW_LUXEDIA), même état de
           visibilité, réversible ensemble. ── */}
      {SHOW_LUXEDIA && (
        <motion.div
          aria-hidden="true"
          className="sv-thread-top"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            x: '-50%',
            width: '1px',
            height: '56px',
            background: `linear-gradient(to bottom, ${colors.gold}, transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <motion.div
        aria-hidden="true"
        className="sv-thread-bottom"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          x: '-50%',
          width: '1px',
          height: '56px',
          background: `linear-gradient(to top, ${colors.gold}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        .sv-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        .sv-visual { order: 2; }
        .sv-text { order: 1; }
        .sv-side { order: 3; }

        /* google.png (1536×1024, ratio 3/2) porte déjà toute la direction artistique —
           le cadre adopte son ratio natif pour ne jamais avoir à la recadrer, et son fond
           charbon reprend la couleur de fond de l'image pour rester invisible si contain
           laisse un pixel de marge par arrondi. */
        .sv-panorama {
          position: relative;
          aspect-ratio: 3 / 2;
          border-radius: 24px;
          overflow: hidden;
          background: ${colors.charcoal};
        }

        .sv-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 20px;
        }

        .sv-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 3.6rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 22px;
        }

        .sv-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .sv-lead {
          font-size: 15.5px;
          line-height: 1.75;
          color: ${colors.muted};
          margin: 0;
          max-width: 420px;
        }

        .sv-benefits {
          list-style: none;
          margin: 0 0 28px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sv-benefit {
          display: flex;
          align-items: baseline;
          gap: 16px;
        }

        .sv-benefit-num {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 20px;
          color: ${colors.gold};
          opacity: 0.7;
        }

        .sv-benefit span:last-child {
          font-size: 14.5px;
          color: ${colors.ink};
        }

        .sv-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          color: ${colors.gold};
          background: none;
          border: none;
          border-bottom: 1px solid rgba(200,164,93,0.35);
          padding-bottom: 3px;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 0.3s ease;
        }

        .sv-cta:hover {
          border-color: ${colors.gold};
        }

        .sv-cta svg {
          transition: transform 0.3s ease;
        }

        .sv-cta:hover svg {
          transform: translateX(4px);
        }

        /* Breakpoint propre à StreetView (≠ 760px du reste du site) : à 834px, la colonne
           texte du split 60/40 tombait à ~280px — trop étroit pour le titre serif. On passe
           en une colonne un peu plus tôt ; le seuil global de padding/fils (760px, ci-dessous)
           n'est pas touché. */
        @media (min-width: 960px) {
          .sv-layout {
            grid-template-columns: 3fr 2fr;
            column-gap: 64px;
            row-gap: 32px;
            align-items: start;
          }

          .sv-visual { grid-column: 1; grid-row: 1 / span 2; order: initial; }
          .sv-text { grid-column: 2; grid-row: 1; order: initial; align-self: end; }
          .sv-side { grid-column: 2; grid-row: 2; order: initial; align-self: start; }
        }

        @media (max-width: 760px) {
          .sv-wrap {
            padding: 110px 24px !important;
          }
          .sv-thread-top,
          .sv-thread-bottom {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
