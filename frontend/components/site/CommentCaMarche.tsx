'use client';

import { motion } from 'framer-motion';
import { Aperture, Layers, Sparkles, QrCode, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

const BORDER = '#E2D8C8';

export default function CommentCaMarche() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Aperture,
      num: '01',
      title: t('Captation immersive', 'Immersive capture'),
      desc: t(
        'Nous capturons votre espace en 3D ou 360°, pour une visite réaliste et fluide.',
        'We capture your space in 3D or 360°, for a realistic and fluid tour.'
      ),
    },
    {
      icon: Layers,
      num: '02',
      title: t('Intégration des contenus', 'Content integration'),
      desc: t(
        'Vos documents, menus, fiches et offres prennent place dans l’expérience.',
        'Your documents, menus, listings and offers are integrated into the experience.'
      ),
    },
    {
      icon: Sparkles,
      num: '03',
      title: t('Luxedia IA', 'Luxedia AI'),
      desc: t(
        'Luxedia guide chaque visiteur, répond aux questions et oriente vers l’action.',
        'Luxedia guides every visitor, answers questions and leads them to action.'
      ),
    },
    {
      icon: QrCode,
      num: '04',
      title: t('Livraison en ligne', 'Online delivery'),
      desc: t(
        'Un lien unique, un QR code, et une diffusion partout où vos clients vous cherchent.',
        'A unique link, a QR code, and distribution everywhere your clients look for you.'
      ),
    },
  ];

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
      id="comment-ca-marche"
      aria-label={t('Comment ça marche', 'How it works')}
      style={{
        backgroundColor: colors.cream,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: '80px',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          style={{
            textAlign: 'center',
            marginBottom: '76px',
          }}
        >
          <motion.p variants={item} className="ccm-label">
            {t('Comment ça marche', 'How it works')}
          </motion.p>

          <motion.h2 variants={item} className="ccm-title">
            {t('Un processus simple,', 'A simple process,')}
            <br />
            <span>{t('des résultats puissants.', 'powerful results.')}</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
          className="ccm-timeline"
        >
          <motion.div
            className="ccm-axis"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          />

          {steps.map((s) => {
            const Icon = s.icon;

            return (
              <motion.div key={s.num} variants={item} className="ccm-step">
                <div className="ccm-marker">
                  <Icon size={18} strokeWidth={1.6} />
                </div>

                <p className="ccm-num">{s.num}</p>

                <h3>{s.title}</h3>

                <p className="ccm-desc">{s.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.25 }}
          className="ccm-note"
        >
          {t(
            'Un accompagnement complet, de la première discussion à la mise en ligne.',
            'Full support, from the first conversation to launch.'
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="ccm-streetview"
        >
          <MapPin size={15} strokeWidth={1.8} />
          {t(
            'Publication native sur Google Street View, directement depuis Matterport.',
            'Native publishing to Google Street View, directly from Matterport.'
          )}
        </motion.div>
      </div>

      <style>{`
        .ccm-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 20px;
        }

        .ccm-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.3rem, 4vw, 4.2rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ccm-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .ccm-timeline {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 32px;
        }

        .ccm-axis {
          position: absolute;
          top: 22px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, rgba(200,164,93,0.7), rgba(200,164,93,0.3));
        }

        .ccm-step {
          position: relative;
          flex: 1;
          text-align: left;
          padding-top: 60px;
        }

        .ccm-marker {
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${colors.white};
          border: 1px solid rgba(200,164,93,0.6);
          color: ${colors.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(200,164,93,0.14);
          z-index: 1;
        }

        .ccm-num {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 26px;
          line-height: 1;
          color: ${colors.gold};
          margin: 0 0 8px;
        }

        .ccm-step h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.2rem, 1.8vw, 1.5rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.25;
          margin: 0 0 10px;
        }

        .ccm-desc {
          font-size: 13.5px;
          line-height: 1.7;
          color: ${colors.muted};
          margin: 0;
          max-width: 240px;
        }

        .ccm-note {
          text-align: center;
          color: ${colors.muted};
          font-size: 15px;
          line-height: 1.8;
          margin: 54px auto 0;
          max-width: 560px;
        }

        .ccm-streetview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: fit-content;
          margin: 22px auto 0;
          padding: 9px 18px;
          border-radius: 999px;
          background: rgba(200,164,93,0.08);
          border: 1px solid rgba(200,164,93,0.28);
          color: ${colors.ink};
          font-size: 13px;
          font-weight: 500;
        }

        .ccm-streetview svg {
          color: ${colors.gold};
          flex-shrink: 0;
        }

        @media (max-width: 760px) {
          .ccm-timeline {
            flex-direction: column;
            gap: 36px;
          }

          .ccm-axis {
            top: 0;
            bottom: 0;
            left: 22px;
            right: auto;
            width: 1px;
            height: auto;
            background: linear-gradient(to bottom, rgba(200,164,93,0.7), rgba(200,164,93,0.3));
          }

          .ccm-step {
            padding-top: 0;
            padding-left: 60px;
            min-height: 44px;
          }
        }
      `}</style>
    </section>
  );
}