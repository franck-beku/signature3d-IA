'use client';

import { useEffect, useState } from 'react';
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
  type LucideIcon,
} from 'lucide-react';
import { offeringsApi, type OfferingDto } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const GOLD = '#C8A45D';
const GOLD_DARK = '#A8863F';
const WHITE = '#FCFBF8';
const CREAM = '#F7F5F2';
const INK = '#101010';
const MUTED = '#6B6458';
const BORDER = '#E2D8C8';

type OfferingView = {
  id: number;
  name: string;
  slug: string;
  level: string;
  levelEn?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  displayOrder: number;
};

type Detail = {
  icon: LucideIcon;
  featuresFr: string[];
  featuresEn: string[];
};

const FALLBACK_OFFERINGS: OfferingView[] = [
  {
    id: 1,
    name: '360°',
    slug: '360',
    level: 'Découverte',
    shortDescription: 'Une expérience visuelle simple et accessible pour présenter rapidement votre espace.',
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'Matterport',
    slug: 'matterport',
    level: 'Professionnel',
    shortDescription: 'Une visite 3D réaliste pour explorer votre espace avec fluidité et précision.',
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'Luxedia IA',
    slug: 'luxedia-ia',
    level: 'Intelligence',
    shortDescription: 'Un assistant intelligent qui répond aux visiteurs et enrichit leur expérience.',
    displayOrder: 3,
  },
  {
    id: 4,
    name: '360° + IA',
    slug: '360-ia',
    level: 'Premium',
    shortDescription: 'Une visite 360° accompagnée par Luxedia pour guider et informer vos visiteurs.',
    displayOrder: 4,
  },
  {
    id: 5,
    name: 'Matterport + IA',
    slug: 'matterport-ia',
    level: 'Signature',
    shortDescription: "Notre expérience complète : l'espace immersif et l'intelligence réunis.",
    displayOrder: 5,
  },
];

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
  professionnel: BY_NAME.Matterport,
  intelligence: BY_NAME['Luxedia IA'],
  premium: BY_NAME['360° + IA'],
  signature: BY_NAME['Matterport + IA'],
};

function resolveDetail(o: OfferingView): Detail {
  const byName = BY_NAME[o.name];
  if (byName) return byName;

  const byLevel = BY_LEVEL[(o.level ?? '').trim().toLowerCase()];
  if (byLevel) return byLevel;

  return { icon: Sparkles, featuresFr: [], featuresEn: [] };
}

export default function Services() {
  const { t, lang } = useLanguage();
  const [offerings, setOfferings] = useState<OfferingView[]>(FALLBACK_OFFERINGS);

  useEffect(() => {
    let active = true;

    offeringsApi
      .getActive()
      .then((res) => {
        if (active && Array.isArray(res) && res.length > 0) {
          setOfferings(
            [...res]
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((o: OfferingDto) => ({
                id: o.id,
                name: o.name,
                slug: o.slug,
                level: o.level ?? '',
                levelEn: o.levelEn,
                shortDescription: o.shortDescription ?? '',
                shortDescriptionEn: o.shortDescriptionEn,
                displayOrder: o.displayOrder,
              }))
          );
        }
      })
      .catch(() => {
        setOfferings(FALLBACK_OFFERINGS);
      });

    return () => {
      active = false;
    };
  }, []);

  const isSignature = (o: OfferingView) =>
    (o.level ?? '').trim().toLowerCase() === 'signature' ||
    o.name.toLowerCase().includes('matterport + ia');

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
      id="services"
      aria-label={t('Nos offres', 'Our offers')}
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
            'radial-gradient(circle at 50% 0%, rgba(200,164,93,0.08) 0%, transparent 48%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fade}
          className="services-header"
        >
          <p className="services-label">{t('Nos offres', 'Our offers')}</p>

          <h2 className="services-title">
            {t('Choisissez votre', 'Choose your')}
            <br />
            <span>{t("niveau d’immersion.", 'level of immersion.')}</span>
          </h2>

          <p className="services-subtitle">
            {t(
              'De la visite simple à l’expérience intelligente complète, chaque offre s’adapte à votre espace, votre secteur et vos objectifs.',
              'From a simple tour to a complete intelligent experience, each offer adapts to your space, sector and objectives.'
            )}
          </p>
        </motion.div>

        {signature && <SignatureCard offer={signature} t={t} lang={lang} />}

        <div className="services-grid-premium">
          {standard.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} lang={lang} index={index} />
          ))}
        </div>

        <div className="services-footer-note">
          <p>
            <Info size={15} />
            {t(
              'Chaque projet est unique — le tarif dépend de votre espace.',
              'Every project is unique — pricing depends on your space.'
            )}
          </p>

          <Link href="/contact" className="services-main-cta">
            {t('Demander une soumission', 'Request a quote')}
            <span>→</span>
          </Link>
        </div>
      </div>

      <style>{`
        .services-header {
          text-align: center;
          margin-bottom: 58px;
        }

        .services-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 20px;
        }

        .services-title {
          font-family: var(--font-cormorant), serif;
          font-weight: 400;
          color: ${INK};
          font-size: clamp(2.3rem, 4vw, 4.3rem);
          line-height: 1.05;
          margin: 0 auto;
          max-width: 920px;
          letter-spacing: -0.02em;
        }

        .services-title span {
          color: ${GOLD};
          font-style: italic;
        }

        .services-subtitle {
          margin: 22px auto 0;
          max-width: 660px;
          font-size: 17px;
          line-height: 1.75;
          color: ${MUTED};
          font-weight: 300;
        }

        .services-grid-premium {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 28px;
        }

        .service-card-premium {
          cursor: default;
          will-change: transform, box-shadow;
        }

        .service-card-premium:hover {
          transform: translateY(-12px);
          box-shadow: 0 34px 86px rgba(0,0,0,0.11);
          border-color: rgba(200,164,93,0.36) !important;
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

        .services-footer-note {
          text-align: center;
          margin-top: 46px;
        }

        .services-footer-note p {
          color: rgba(16,16,16,0.58);
          font-size: 15px;
          margin-bottom: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .services-footer-note svg {
          color: ${GOLD};
        }

        .services-main-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: ${INK};
          color: #FFFFFF;
          border-radius: 4px;
          padding: 16px 36px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .services-main-cta:hover {
          background-color: ${GOLD};
          color: ${INK};
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
  offer: OfferingView;
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

  const displayLevel = lang === 'en' ? (offer.levelEn || offer.level) : offer.level;
  const displayShortDescription = lang === 'en' ? (offer.shortDescriptionEn || offer.shortDescription) : offer.shortDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="signature-card-premium"
      style={{
        position: 'relative',
        border: '1px solid rgba(200,164,93,0.65)',
        borderRadius: '18px',
        overflow: 'hidden',
        background:
          'linear-gradient(110deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.78) 50%, rgba(200,164,93,0.12) 100%)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.10)',
        padding: '36px 40px',
      }}
    >
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
          <span className="signature-badge">★ {displayLevel || 'Signature'}</span>

          <h3 className="signature-title">{offer.name}</h3>

          <p className="signature-text">
            {displayShortDescription ||
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
              <div key={item} className="signature-feature">
                <div className="signature-feature-icon">
                  <Icon size={24} strokeWidth={1.4} color={GOLD} />
                </div>

                <p>{item}</p>
                <span>{signatureSub[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .signature-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(200,164,93,0.24);
          color: ${INK};
          border-radius: 6px;
          padding: 8px 13px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 22px;
        }

        .signature-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 500;
          line-height: 1.08;
          color: ${INK};
          margin: 0 0 18px;
        }

        .signature-text {
          color: rgba(16,16,16,0.72);
          font-size: 17px;
          line-height: 1.75;
          font-weight: 300;
          margin: 0;
          max-width: 420px;
        }

        .signature-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .signature-feature {
          text-align: center;
        }

        .signature-feature-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.86);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .signature-feature p {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: ${INK};
        }

        .signature-feature span {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          color: rgba(16,16,16,0.55);
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

function OfferCard({
  offer,
  lang,
  index,
}: {
  offer: OfferingView;
  lang: string;
  index: number;
}) {
  const details = resolveDetail(offer);
  const Icon = details.icon;
  const features = lang === 'fr' ? details.featuresFr : details.featuresEn;
  const displayLevel = lang === 'en' ? (offer.levelEn || offer.level) : offer.level;
  const displayShortDescription = lang === 'en' ? (offer.shortDescriptionEn || offer.shortDescription) : offer.shortDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.1,
      }}
      className="service-card-premium"
      style={{
        position: 'relative',
        backgroundColor: CREAM,
        border: `1px solid ${BORDER}`,
        borderRadius: '16px',
        boxShadow: '0 18px 50px rgba(0,0,0,0.06)',
        padding: '30px 26px',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="service-icon">
        <Icon size={25} strokeWidth={1.4} color={GOLD} />
      </div>

      {displayLevel && <p className="service-level">{displayLevel}</p>}

      <h3>{offer.name}</h3>

      <div className="service-line" />

      <p className="service-description">{displayShortDescription}</p>

      {features.length > 0 && (
        <ul className="service-features">
          {features.map((f) => (
            <li key={f}>
              <Check size={15} strokeWidth={1.7} color={GOLD} />
              {f}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .service-icon {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          margin: 0 0 18px;
          background-color: #fff;
          box-shadow: 0 10px 28px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service-level {
          margin: 0 0 10px;
          color: ${GOLD};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .service-card-premium h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.7rem, 2vw, 2.2rem);
          font-weight: 500;
          color: ${INK};
          margin: 0 0 14px;
        }

        .service-line {
          width: 34px;
          height: 1px;
          background-color: ${GOLD};
          margin: 0 0 20px;
          transition: width 0.35s ease;
        }

        .service-description {
          font-size: 15px;
          line-height: 1.75;
          color: rgba(16,16,16,0.62);
          font-weight: 300;
          margin: 0 0 22px;
        }

        .service-features {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
          display: grid;
          gap: 10px;
        }

        .service-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: rgba(16,16,16,0.72);
        }
      `}</style>
    </motion.div>
  );
}