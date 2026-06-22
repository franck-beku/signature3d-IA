'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Box,
  MessageCircle,
  Sparkles,
  Users,
  Check,
  Info,
  RotateCw,
} from 'lucide-react';
import { offeringsApi, type OfferingDto } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const GOLD = '#C8A45D';
const CREAM = '#F7F5F2';
const TEXT = '#101010';

type Detail = {
  icon: typeof Box;
  featuresFr: string[];
  featuresEn: string[];
};

/* Détails d'affichage (icône + features) par offre.
   Indexés par NOM et par NIVEAU : si une offre est renommée dans le dashboard,
   on retombe sur le niveau (plus stable) plutôt que sur de fausses features. */
const BY_NAME: Record<string, Detail> = {
  '360°': {
    icon: RotateCw,
    featuresFr: ['Vue 360°', 'Navigation fluide', 'Tout appareil'],
    featuresEn: ['360° view', 'Fluid navigation', 'Any device'],
  },
  Matterport: {
    icon: Box,
    featuresFr: ['Visite 3D réaliste', 'Déplacement libre', 'Mesures précises'],
    featuresEn: ['Realistic 3D tour', 'Free movement', 'Precise measurements'],
  },
  'Luxedia IA': {
    icon: MessageCircle,
    featuresFr: ['Réponses 24/7', 'Multilingue', 'Capture de contacts'],
    featuresEn: ['24/7 answers', 'Multilingual', 'Contact capture'],
  },
  '360° + IA': {
    icon: Sparkles,
    featuresFr: ['Vue 360°', 'Luxedia intégrée', 'Guidage en direct'],
    featuresEn: ['360° view', 'Luxedia integrated', 'Live guidance'],
  },
  'Matterport + IA': {
    icon: Box,
    featuresFr: ['Visite 3D', 'Luxedia IA', 'Leads qualifiés', 'Principe 80/20'],
    featuresEn: ['3D tour', 'Luxedia AI', 'Qualified leads', '80/20 principle'],
  },
};

const BY_LEVEL: Record<string, Detail> = {
  découverte: BY_NAME['360°'],
  professionnel: BY_NAME['Matterport'],
  intelligence: BY_NAME['Luxedia IA'],
  premium: BY_NAME['360° + IA'],
  signature: BY_NAME['Matterport + IA'],
};

/* Résout les détails sans jamais inventer de fausses promesses :
   1) par nom exact, 2) par niveau, 3) fallback neutre (icône seule, 0 feature). */
function resolveDetail(o: OfferingDto): Detail {
  const byName = BY_NAME[o.name];
  if (byName) return byName;
  const byLevel = BY_LEVEL[(o.level ?? '').trim().toLowerCase()];
  if (byLevel) return byLevel;
  return { icon: Sparkles, featuresFr: [], featuresEn: [] };
}

export default function Services() {
  const { t, lang } = useLanguage();
  const [offerings, setOfferings] = useState<OfferingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    offeringsApi
      .getActive()
      .then((res) => {
        if (active && Array.isArray(res)) {
          setOfferings([...res].sort((a, b) => a.displayOrder - b.displayOrder));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isSignature = (o: OfferingDto) =>
    (o.level ?? '').trim().toLowerCase() === 'signature';

  const signature = offerings.find(isSignature);
  const standard = offerings.filter((o) => !isSignature(o));

  const fade = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label={t('Services', 'Services')}
      style={{
        backgroundColor: CREAM,
        color: TEXT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '105px 32px',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={fade}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: '22px',
            }}
          >
            {t('Nos offres', 'Our offers')}
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 500,
              color: TEXT,
              fontSize: 'clamp(2.1rem, 4.3vw, 4rem)',
              lineHeight: 1.08,
              margin: '0 auto',
              maxWidth: '980px',
              letterSpacing: '-0.02em',
            }}
          >
            {t(
              'Une gamme, du plus simple au plus complet.',
              'A range, from the simplest to the most complete.'
            )}
          </h2>

          <p
            style={{
              marginTop: '18px',
              fontSize: '18px',
              color: 'rgba(16,16,16,0.65)',
              fontWeight: 300,
            }}
          >
            {t(
              'Choisissez l’expérience qui correspond à vos objectifs.',
              'Choose the experience that matches your goals.'
            )}
          </p>
        </motion.div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(16,16,16,0.5)' }}>
            {t('Chargement…', 'Loading…')}
          </p>
        ) : offerings.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(16,16,16,0.5)' }}>
            {t('Offres bientôt disponibles.', 'Offers coming soon.')}
          </p>
        ) : (
          <>
            {signature && <SignatureCard offer={signature} t={t} lang={lang} />}

            <div className="services-grid-premium">
              {standard.map((offer, index) => (
                <OfferCard key={offer.id} offer={offer} lang={lang} index={index} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '42px' }}>
              <p
                style={{
                  color: 'rgba(16,16,16,0.58)',
                  fontSize: '15px',
                  marginBottom: '22px',
                }}
              >
                <Info size={15} style={{ display: 'inline', marginRight: 8, color: GOLD }} />
                {t(
                  'Chaque projet est unique — le tarif dépend de votre espace.',
                  'Every project is unique — pricing depends on your space.'
                )}
              </p>

              <Link
                href="/contact"
                className="services-main-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: GOLD,
                  color: '#111',
                  borderRadius: '8px',
                  padding: '16px 36px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {t('Demander une soumission', 'Request a quote')}
                <span>→</span>
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        .services-grid-premium {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 26px;
        }

        .service-card-premium {
          cursor: default;
          will-change: transform, box-shadow;
        }

        .service-card-premium:hover {
          transform: translateY(-14px);
          box-shadow: 0 40px 90px rgba(0,0,0,0.12);
          border-color: rgba(200,164,93,0.28) !important;
        }

        .service-card-premium:hover .service-line {
          width: 54px !important;
        }

        .signature-card-premium {
          will-change: transform, box-shadow;
        }

        .signature-card-premium:hover {
          transform: translateY(-6px);
          box-shadow: 0 38px 100px rgba(200,164,93,0.18);
        }

        .services-main-cta {
          transition: all 0.3s ease;
        }

        .services-main-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 54px rgba(200,164,93,0.36);
        }

        @media (max-width: 980px) {
          .services-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .services-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function SignatureCard({
  offer,
  t,
  lang,
}: {
  offer: OfferingDto;
  t: (fr: string, en: string) => string;
  lang: string;
}) {
  const signatureItems =
    lang === 'fr'
      ? ['Visite 3D', 'Luxedia IA', 'Leads qualifiés', 'Principe 80/20']
      : ['3D tour', 'Luxedia AI', 'Qualified leads', '80/20 principle'];

  const signatureSub =
    lang === 'fr'
      ? ['immersion totale', 'assistant intelligent', 'contacts & actions', "l'efficacité avant tout"]
      : ['total immersion', 'intelligent assistant', 'contacts & actions', 'efficiency first'];

  const icons = [Box, MessageCircle, Users, Sparkles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="signature-card-premium"
      style={{
        position: 'relative',
        border: `1px solid ${GOLD}`,
        borderRadius: '18px',
        overflow: 'hidden',
        background:
          'linear-gradient(110deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.7) 50%, rgba(200,164,93,0.10) 100%)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.10)',
        padding: '34px 38px',
      }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 90% 40%, rgba(200,164,93,0.18), transparent 38%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="signature-inner"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '46px',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(200,164,93,0.35)',
              color: TEXT,
              borderRadius: '6px',
              padding: '8px 13px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginBottom: '22px',
            }}
          >
            ★ {offer.level || 'Signature'}
          </span>

          <h3
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 3vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              color: TEXT,
              margin: '0 0 18px',
            }}
          >
            {offer.name}
          </h3>

          <p
            style={{
              color: 'rgba(16,16,16,0.72)',
              fontSize: '17px',
              lineHeight: 1.75,
              fontWeight: 300,
              margin: 0,
              maxWidth: '420px',
            }}
          >
            {offer.shortDescription ||
              t(
                "Notre expérience complète : l'espace et l'intelligence réunis.",
                'Our complete experience: space and intelligence together.'
              )}
          </p>
        </div>

        <div className="signature-features">
          {signatureItems.map((item, index) => {
            const Icon = icons[index] || Sparkles;
            return (
              <div key={item} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon size={24} strokeWidth={1.4} color={GOLD} />
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: TEXT }}>
                  {item}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(16,16,16,0.55)' }}>
                  {signatureSub[index]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .signature-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        @media (max-width: 900px) {
          .signature-inner {
            grid-template-columns: 1fr !important;
          }

          .signature-features {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </motion.div>
  );
}

function OfferCard({ offer, lang, index }: { offer: OfferingDto; lang: string; index: number }) {
  const details = resolveDetail(offer);
  const Icon = details.icon;
  const features = lang === 'fr' ? details.featuresFr : details.featuresEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
      className="service-card-premium"
      style={{
        position: 'relative',
        backgroundColor: 'rgba(255,255,255,0.82)',
        border: '1px solid rgba(16,16,16,0.06)',
        borderRadius: '16px',
        boxShadow: '0 18px 50px rgba(0,0,0,0.06)',
        padding: '30px 26px',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Halo doux (cohérence avec la Signature, en plus discret) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(200,164,93,0.06), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="service-icon"
        style={{
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          margin: '0 0 18px',
          backgroundColor: '#fff',
          boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s ease',
        }}
      >
        <Icon size={25} strokeWidth={1.4} color={GOLD} />
      </div>

      {offer.level && (
        <p
          style={{
            margin: '0 0 10px',
            color: GOLD,
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {offer.level}
        </p>
      )}

      <h3
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(1.7rem, 2vw, 2.2rem)',
          fontWeight: 500,
          color: TEXT,
          margin: '0 0 14px',
        }}
      >
        {offer.name}
      </h3>

      <div
        className="service-line"
        style={{
          width: '34px',
          height: '1px',
          backgroundColor: GOLD,
          margin: '0 0 20px',
          transition: 'width 0.35s ease',
        }}
      />

      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'rgba(16,16,16,0.62)',
          fontWeight: 300,
          margin: '0 0 22px',
          minHeight: '0',
        }}
      >
        {offer.shortDescription}
      </p>

      {features.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            textAlign: 'left',
            display: 'grid',
            gap: '10px',
          }}
        >
          {features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'rgba(16,16,16,0.72)',
              }}
            >
              <Check size={15} strokeWidth={1.7} color={GOLD} />
              {f}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}