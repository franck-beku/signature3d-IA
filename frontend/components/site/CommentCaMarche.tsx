'use client';

import { motion } from 'framer-motion';
import { Aperture, Layers, Sparkles, QrCode } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const GOLD = '#C8A45D';
const CREAM = '#F7F5F2';
const CARD = '#FCFBF8';
const INK = '#101010';
const MUTED = '#6B6458';
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
        'Un lien unique et un QR code prêts à partager avec vos clients.',
        'A unique link and QR code ready to share with your clients.'
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
      aria-label={t('Comment ça marche', 'How it works')}
      style={{
        backgroundColor: CREAM,
        color: INK,
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '120px 32px',
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
          className="ccm-steps"
        >
          <div className="ccm-line" aria-hidden="true" />

          {steps.map((s) => {
            const Icon = s.icon;

            return (
              <motion.div key={s.num} variants={item} className="ccm-step">
                <div className="ccm-icon">
                  <Icon size={26} strokeWidth={1.4} />
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
      </div>

      <style>{`
        .ccm-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 20px;
        }

        .ccm-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.3rem, 4vw, 4.2rem);
          font-weight: 400;
          color: ${INK};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ccm-title span {
          color: ${GOLD};
          font-style: italic;
        }

        .ccm-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
        }

        .ccm-line {
          position: absolute;
          top: 38px;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(200,164,93,0.6),
            transparent
          );
        }

        .ccm-step {
          position: relative;
          z-index: 1;
          text-align: center;
          background: ${CARD};
          border: 1px solid ${BORDER};
          border-radius: 18px;
          padding: 34px 24px 32px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .ccm-step:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 80px rgba(0,0,0,0.09);
          border-color: rgba(200,164,93,0.5);
        }

        .ccm-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid rgba(200,164,93,0.55);
          color: ${GOLD};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 34px rgba(200,164,93,0.14);
        }

        .ccm-num {
          font-family: var(--font-cormorant), serif;
          font-size: 16px;
          letter-spacing: 0.24em;
          color: ${GOLD};
          margin: 0 0 12px;
        }

        .ccm-step h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.3rem, 2vw, 1.65rem);
          font-weight: 400;
          color: ${INK};
          line-height: 1.25;
          margin: 0 0 14px;
        }

        .ccm-desc {
          font-size: 14px;
          line-height: 1.7;
          color: ${MUTED};
          margin: 0 auto;
          max-width: 230px;
        }

        .ccm-note {
          text-align: center;
          color: ${MUTED};
          font-size: 15px;
          line-height: 1.8;
          margin: 54px auto 0;
          max-width: 560px;
        }

        @media (max-width: 980px) {
          .ccm-steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .ccm-line {
            display: none;
          }
        }

        @media (max-width: 560px) {
          .ccm-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}