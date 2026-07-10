'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Compass, UserCheck, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors, aiSignal } from '@/config/theme';

const CAPABILITIES = [
  { key: 'answers', icon: MessageCircle, fr: 'Répond aux questions', en: 'Answers questions' },
  { key: 'guides', icon: Compass, fr: 'Guide la visite', en: 'Guides the tour' },
  { key: 'leads', icon: UserCheck, fr: 'Capture des prospects', en: 'Captures leads' },
  { key: 'always', icon: Clock, fr: 'Disponible 24/7', en: 'Available 24/7' },
];

const PERSONAS = [
  {
    key: 'aria',
    name: 'Aria',
    color: aiSignal.indigo,
    messageFr: 'Bonjour ! Je suis Aria, comment puis-je vous aider ?',
    messageEn: "Hi! I'm Aria, how can I help you?",
  },
  {
    key: 'max',
    name: 'Max',
    color: colors.gold,
    messageFr: 'Salut, je suis Max — posez-moi vos questions !',
    messageEn: "Hey, I'm Max — ask me anything!",
  },
  {
    key: 'nova',
    name: 'Nova',
    color: '#3FA796',
    messageFr: 'Bienvenue, je suis Nova, ravie de vous accompagner.',
    messageEn: "Welcome, I'm Nova, happy to help.",
  },
];

export default function Luxedia() {
  const { t } = useLanguage();

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

  return (
    <section
      aria-label={t('Luxedia, un assistant à votre image', 'Luxedia, an assistant in your image')}
      style={{
        backgroundColor: colors.charcoal,
        color: '#F7F5F2',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(91,110,234,0.16) 0%, transparent 48%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '150px 32px',
        }}
        className="luxedia-wrap"
      >
        {/* ── Partie 1 : rôle ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <motion.p variants={item} className="luxedia-label">
            LUXEDIA
          </motion.p>
          <motion.h2 variants={item} className="luxedia-title">
            {t('Un assistant', 'An assistant')}{' '}
            <span>{t('à votre image.', 'in your image.')}</span>
          </motion.h2>
          <motion.p variants={item} className="luxedia-lead">
            {t(
              'Luxedia répond aux questions de vos visiteurs, les guide à travers la visite et capture des prospects qualifiés — 24 heures sur 24, 7 jours sur 7.',
              "Luxedia answers your visitors' questions, guides them through the tour, and captures qualified leads — 24 hours a day, 7 days a week."
            )}
          </motion.p>

          <motion.div variants={item} className="luxedia-caps">
            {CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} className="luxedia-cap">
                  <span className="luxedia-cap-icon">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  {t(c.fr, c.en)}
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ── Partie 2 : personnalisation ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
          className="luxedia-personas"
        >
          {PERSONAS.map((p) => (
            <motion.div key={p.key} variants={item} className="luxedia-persona">
              <div className="luxedia-avatar" style={{ borderColor: p.color, boxShadow: `0 0 34px ${p.color}33` }}>
                <Image src="/luxedia-avatar.png" alt={p.name} width={72} height={72} />
              </div>
              <p className="luxedia-name" style={{ color: p.color }}>{p.name}</p>
              <div className="luxedia-bubble" style={{ borderLeftColor: p.color }}>
                {t(p.messageFr, p.messageEn)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="luxedia-caption"
        >
          {t(
            'Personnalisez le nom, la couleur et l’avatar selon votre marque.',
            'Customize the name, color, and avatar to match your brand.'
          )}
        </motion.p>
      </div>

      <style>{`
        .luxedia-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: ${aiSignal.indigo};
          margin-bottom: 20px;
        }

        .luxedia-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 400;
          color: #FFFFFF;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 auto 22px;
        }

        .luxedia-title span {
          color: ${aiSignal.indigo};
          font-style: italic;
        }

        .luxedia-lead {
          max-width: 560px;
          margin: 0 auto;
          font-size: 16px;
          line-height: 1.75;
          color: rgba(247,245,242,0.72);
        }

        .luxedia-caps {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 40px;
        }

        .luxedia-cap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(91,110,234,0.10);
          border: 1px solid rgba(91,110,234,0.28);
          color: rgba(247,245,242,0.88);
          font-size: 13px;
          font-weight: 500;
        }

        .luxedia-cap-icon {
          display: inline-flex;
          color: ${aiSignal.indigo};
        }

        .luxedia-personas {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 12px;
        }

        .luxedia-persona {
          text-align: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 34px 24px;
        }

        .luxedia-avatar {
          width: 72px;
          height: 72px;
          margin: 0 auto 18px;
          border-radius: 50%;
          border: 2px solid;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxedia-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .luxedia-name {
          font-family: var(--font-cormorant), serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 16px;
        }

        .luxedia-bubble {
          text-align: left;
          background: rgba(255,255,255,0.05);
          border-left: 3px solid;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(247,245,242,0.82);
        }

        .luxedia-caption {
          text-align: center;
          margin-top: 30px;
          font-size: 13.5px;
          font-style: italic;
          color: rgba(247,245,242,0.5);
        }

        @media (max-width: 760px) {
          .luxedia-wrap {
            padding: 110px 24px !important;
          }
          .luxedia-personas {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
