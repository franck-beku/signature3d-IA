'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

type Univers = {
  slug: string;
  image: string;
  label: { fr: string; en: string };
  titre: { fr: string; en: string };
  accroche: { fr: string; en: string };
};

const GOLD = '#C8A45D';
const WHITE = '#FCFBF8';
const INK = '#101010';
const BORDER = '#E7DED0';

const UNIVERS: Univers[] = [
  {
    slug: 'automobile',
    image: '/assets/univers/automobile-nouveau.jpeg',
    label: { fr: 'SHOWROOM', en: 'SHOWROOM' },
    titre: { fr: 'Automobile', en: 'Automotive' },
    accroche: { fr: 'Chaque modèle, exploré en détail.', en: 'Every model, explored in detail.' },
  },
  {
    slug: 'immobilier',
    image: '/assets/univers/immobilier.jpg',
    label: { fr: 'RÉSIDENTIEL & COMMERCIAL', en: 'RESIDENTIAL & COMMERCIAL' },
    titre: { fr: 'Immobilier', en: 'Real Estate' },
    accroche: { fr: 'Visite pièce par pièce.', en: 'Room by room.' },
  },
  {
    slug: 'restaurant',
    image: '/assets/univers/restaurant-nouveau.jpeg',
    label: { fr: 'AMBIANCE', en: 'ATMOSPHERE' },
    titre: { fr: 'Restauration', en: 'Restaurants' },
    accroche: { fr: 'L’atmosphère avant la réservation.', en: 'The atmosphere before the reservation.' },
  },
  {
    slug: 'hotellerie',
    image: '/assets/univers/hotellerie-nouveau.jpeg',
    label: { fr: 'CHAMBRES & ESPACES', en: 'ROOMS & SPACES' },
    titre: { fr: 'Hôtellerie', en: 'Hospitality' },
    accroche: { fr: 'Réserver en connaissance de cause.', en: 'Book with confidence.' },
  },
  {
    slug: 'commerce',
    image: '/assets/univers/commerce-nouveau.jpeg',
    label: { fr: 'BOUTIQUE', en: 'STOREFRONT' },
    titre: { fr: 'Commerce', en: 'Retail' },
    accroche: { fr: 'La découverte avant la visite.', en: 'Discovery before the visit.' },
  },
];

export default function NosUnivers() {
  const { t } = useLanguage();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label={t('Nos univers', 'Our worlds')}
      style={{
        backgroundColor: WHITE,
        color: INK,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 0%, rgba(200,164,93,0.07) 0%, transparent 44%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '160px 32px 170px',
        }}
        className="univers-wrap"
      >
        {/* ── En-tête de section — inchangé ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: '32px',
            marginBottom: '58px',
          }}
          className="univers-header"
        >
          <motion.div variants={item}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.34em',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: '18px',
              }}
            >
              {t('Nos univers', 'Our worlds')}
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontWeight: 400,
                color: INK,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2.2rem, 4vw, 4rem)',
                margin: 0,
                maxWidth: '720px',
              }}
            >
              {t('Des solutions immersives', 'Immersive solutions')}
              <br />
              <span style={{ color: GOLD, fontStyle: 'italic' }}>
                {t('adaptées à chaque secteur.', 'designed for every sector.')}
              </span>
            </h2>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/realisations"
              className="univers-all-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                border: `1px solid rgba(200,164,93,0.7)`,
                color: INK,
                backgroundColor: 'transparent',
                borderRadius: '4px',
                padding: '13px 22px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {t('Découvrir tous les univers', 'Discover all worlds')}
              <span style={{ color: GOLD }}>→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Grille — nouveau format paysage, 2 par ligne ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={container}
          className="univers-grid"
        >
          {UNIVERS.map((univers) => (
            <motion.article
              key={univers.slug}
              variants={item}
              className="univers-card"
            >
              <Link href={`/realisations/${univers.slug}`} className="univers-media">
                <img
                  src={univers.image}
                  alt={t(univers.titre.fr, univers.titre.en)}
                  className="univers-img"
                />

                <div className="univers-scrim" aria-hidden="true" />

                <div className="univers-overlay">
                  <p className="univers-cat">{t(univers.label.fr, univers.label.en)}</p>
                  <h3 className="univers-name">{t(univers.titre.fr, univers.titre.en)}</h3>
                  <p className="univers-tagline">{t(univers.accroche.fr, univers.accroche.en)}</p>

                  <span className="univers-card-link">
                    {t('Voir les projets', 'View projects')}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <style>{`
        .univers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .univers-card:last-child {
          grid-column: 1 / -1;
        }

        .univers-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid ${BORDER};
          box-shadow: 0 18px 50px rgba(0,0,0,0.06);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .univers-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 34px 80px rgba(0,0,0,0.10);
          border-color: rgba(200,164,93,0.48);
        }

        .univers-media {
          position: relative;
          display: block;
          aspect-ratio: 3 / 2;
          text-decoration: none;
          color: inherit;
        }

        .univers-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }

        .univers-card:hover .univers-img {
          transform: scale(1.06);
        }

        .univers-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11,11,11,0.78) 0%, rgba(11,11,11,0.25) 45%, transparent 75%);
        }

        .univers-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 30px 32px 32px;
        }

        .univers-cat {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: ${GOLD};
          margin: 0 0 12px;
        }

        .univers-name {
          font-family: var(--font-cormorant), serif;
          font-weight: 500;
          font-size: clamp(1.8rem, 2.6vw, 2.6rem);
          line-height: 1.05;
          color: #FFFFFF;
          margin: 0 0 8px;
        }

        .univers-tagline {
          font-size: 14.5px;
          font-style: italic;
          line-height: 1.6;
          color: rgba(247,245,242,0.78);
          margin: 0 0 20px;
        }

        .univers-card-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: ${GOLD};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: gap 0.25s ease;
        }

        .univers-card:hover .univers-card-link {
          gap: 16px;
        }

        .univers-all-link:hover {
          background-color: #101010 !important;
          color: #FFFFFF !important;
          border-color: #101010 !important;
        }

        @media (max-width: 760px) {
          .univers-wrap {
            padding: 120px 24px 130px !important;
          }

          .univers-header {
            align-items: flex-start !important;
            flex-direction: column !important;
          }

          .univers-grid {
            grid-template-columns: 1fr;
          }

          .univers-card:last-child {
            grid-column: auto;
          }
        }
      `}</style>
    </section>
  );
}
