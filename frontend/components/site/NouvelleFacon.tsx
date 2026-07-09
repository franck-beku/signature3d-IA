'use client';

import { motion } from 'framer-motion';
import { Aperture, MessageCircle, QrCode, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors, aiSignal } from '@/config/theme';

type Feature = {
  key: string;
  icon: LucideIcon;
  isAi?: boolean;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
};

const FEATURES: Feature[] = [
  {
    key: 'visites',
    icon: Aperture,
    titleFr: 'Visites immersives 3D & 360°',
    titleEn: 'Immersive 3D & 360° tours',
    descFr: 'Explorez chaque espace comme si vous y étiez, sur ordinateur, mobile ou tablette.',
    descEn: 'Explore every space as if you were there — on desktop, mobile, or tablet.',
  },
  {
    key: 'luxedia',
    icon: MessageCircle,
    isAi: true,
    titleFr: 'Luxedia, votre assistant IA',
    titleEn: 'Luxedia, your AI assistant',
    descFr: 'Répond aux visiteurs, présente vos services et vous aide à générer des prospects, 24h/24.',
    descEn: 'Answers visitors, showcases your services, and helps you generate leads, 24/7.',
  },
  {
    key: 'diffusion',
    icon: QrCode,
    titleFr: 'Diffusion & visibilité',
    titleEn: 'Distribution & visibility',
    descFr: 'Partagez votre visite via un lien, un QR Code ou Google Street View.',
    descEn: 'Share your tour via a link, a QR code, or Google Street View.',
  },
];

export default function NouvelleFacon() {
  const { t } = useLanguage();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label={t('Une nouvelle façon de présenter vos espaces', 'A new way to showcase your spaces')}
      style={{
        backgroundColor: colors.white,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '140px 32px',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          style={{ textAlign: 'center', marginBottom: '68px' }}
        >
          <motion.p variants={item} className="nf-label">
            {t('Ce que vous obtenez', 'What you get')}
          </motion.p>
          <motion.h2 variants={item} className="nf-title">
            {t('Une nouvelle façon de', 'A new way to')}
            <br />
            <span>{t('présenter vos espaces.', 'showcase your spaces.')}</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
          className="nf-grid"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.key} variants={item} className="nf-card">
                <div className={f.isAi ? 'nf-icon nf-icon-ai' : 'nf-icon'}>
                  <Icon size={26} strokeWidth={1.4} />
                </div>

                {f.isAi && (
                  <span className="nf-badge">
                    {t('Intelligence artificielle', 'Artificial intelligence')}
                  </span>
                )}

                <h3>{t(f.titleFr, f.titleEn)}</h3>
                <p className="nf-desc">{t(f.descFr, f.descEn)}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        .nf-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 20px;
        }

        .nf-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .nf-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .nf-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .nf-card {
          text-align: center;
          background: ${colors.cream};
          border: 1px solid ${colors.border};
          border-radius: 18px;
          padding: 40px 28px 36px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .nf-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 36px 90px rgba(0,0,0,0.14);
          border-color: rgba(200,164,93,0.4);
        }

        .nf-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 22px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid rgba(200,164,93,0.55);
          color: ${colors.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 34px rgba(200,164,93,0.14);
        }

        /* Seule la carte Luxedia porte l'accent IA — discret, jamais en fond dominant */
        .nf-icon-ai {
          border-color: rgba(91,110,234,0.45);
          color: ${aiSignal.indigo};
          box-shadow: 0 14px 34px rgba(91,110,234,0.14);
        }

        .nf-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgba(91,110,234,0.08);
          color: ${aiSignal.indigo};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .nf-card h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.4rem, 2vw, 1.7rem);
          font-weight: 500;
          color: ${colors.ink};
          margin: 0 0 12px;
        }

        .nf-desc {
          font-size: 14.5px;
          line-height: 1.7;
          color: ${colors.muted};
          margin: 0;
        }

        @media (max-width: 900px) {
          .nf-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
