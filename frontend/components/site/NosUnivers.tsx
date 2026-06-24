'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

type Univers = {
  slug: string;
  image: string;
  titre: string;
  accroche: { fr: string; en: string };
};

const GOLD = '#C8A45D';
const CREAM = '#F7F5F2';
const WHITE = '#FCFBF8';
const INK = '#101010';
const MUTED = '#5E5A52';
const BORDER = '#E7DED0';

const UNIVERS: Univers[] = [
  {
    slug: 'automobile',
    image: '/assets/univers/auto.jpg',
    titre: 'Automobile',
    accroche: {
      fr: 'Mettez en valeur vos véhicules et vos espaces.',
      en: 'Showcase your vehicles and spaces.',
    },
  },
  {
    slug: 'immobilier',
    image: '/assets/univers/immobilier.jpg',
    titre: 'Immobilier',
    accroche: {
      fr: 'Valorisez chaque propriété et maximisez son potentiel.',
      en: 'Enhance every property and maximize its potential.',
    },
  },
  {
    slug: 'restaurant',
    image: '/assets/univers/resto.jpg',
    titre: 'Restauration',
    accroche: {
      fr: 'Faites découvrir l’ambiance avant la première visite.',
      en: 'Reveal the atmosphere before the first visit.',
    },
  },
  {
    slug: 'hotellerie',
    image: '/assets/univers/hotel.jpg',
    titre: 'Hôtellerie',
    accroche: {
      fr: 'Offrez une expérience qui commence en ligne.',
      en: 'Offer an experience that begins online.',
    },
  },
  {
    slug: 'commerce',
    image: '/assets/univers/commerce.jpg',
    titre: 'Commerce',
    accroche: {
      fr: 'Présentez vos espaces et vos produits autrement.',
      en: 'Present your spaces and products differently.',
    },
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
              style={{
                backgroundColor: CREAM,
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
                borderRadius: '18px',
                minHeight: '430px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
              }}
            >
              <Link
                href={`/realisations/${univers.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '230px',
                    overflow: 'hidden',
                    backgroundColor: '#ddd',
                  }}
                >
                  <img
                    src={univers.image}
                    alt={univers.titre}
                    className="univers-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.8s ease',
                    }}
                  />
                </div>

                <div style={{ padding: '28px 24px 30px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: INK,
                        margin: 0,
                      }}
                    >
                      {univers.titre}
                    </h3>

                    <span
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: 'rgba(200,164,93,0.65)',
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.75,
                      color: MUTED,
                      margin: 0,
                      minHeight: '54px',
                    }}
                  >
                    {t(univers.accroche.fr, univers.accroche.en)}
                  </p>

                  <div
                    className="univers-card-link"
                    style={{
                      marginTop: '26px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: GOLD,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('Voir les projets', 'View projects')}
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <style>{`
        .univers-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
        }

        .univers-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 34px 80px rgba(0,0,0,0.10);
          border-color: rgba(200,164,93,0.48) !important;
        }

        .univers-card:hover .univers-img {
          transform: scale(1.06);
        }

        .univers-card:hover .univers-card-link {
          gap: 16px !important;
        }

        .univers-all-link:hover {
          background-color: #101010 !important;
          color: #FFFFFF !important;
          border-color: #101010 !important;
        }

        @media (max-width: 1180px) {
          .univers-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 780px) {
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

          .univers-card {
            min-height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}