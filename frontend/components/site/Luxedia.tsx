'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Compass, UserCheck, Clock, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

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
    color: colors.goldDark,
    questionFr: 'Quelles sont les disponibilités cette semaine ?',
    questionEn: 'What availability is there this week?',
    answerFr: 'Je peux vérifier ça pour vous immédiatement.',
    answerEn: 'I can check that for you right away.',
  },
  {
    key: 'max',
    name: 'Max',
    color: colors.gold,
    questionFr: 'Puis-je avoir plus de détails sur ce modèle ?',
    questionEn: 'Can I get more details on this model?',
    answerFr: 'Bien sûr, laissez-moi vous montrer les caractéristiques.',
    answerEn: 'Of course, let me show you the features.',
  },
  {
    key: 'nova',
    name: 'Nova',
    color: '#3FA796',
    questionFr: 'Une visite est-elle possible ce soir ?',
    questionEn: 'Is a visit possible tonight?',
    answerFr: 'Oui, je vous montre les créneaux disponibles.',
    answerEn: 'Yes, let me show you the available slots.',
  },
];

export default function Luxedia() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const activePersona = PERSONAS[active];

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
          background: 'radial-gradient(circle at 50% 0%, rgba(200,164,93,0.16) 0%, transparent 48%)',
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

        {/* ── Partie 2 : démonstration d'interface ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
          className="luxedia-demo"
        >
          <motion.div
            variants={item}
            className="luxedia-tabs"
            role="tablist"
            aria-label={t('Choisir une personnalisation', 'Choose a customization')}
          >
            {PERSONAS.map((p, i) => (
              <button
                key={p.key}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className="luxedia-tab"
                style={{
                  backgroundColor: i === active ? p.color : 'transparent',
                  color: i === active ? '#0B0B0B' : 'rgba(247,245,242,0.55)',
                  borderColor: i === active ? p.color : 'rgba(255,255,255,0.1)',
                }}
              >
                {p.name}
              </button>
            ))}
          </motion.div>

          <motion.div variants={item} className="luxedia-panel">
            <span className="luxedia-panel-tag">{t('Aperçu', 'Preview')}</span>

            <div className="luxedia-panel-header">
              <div className="luxedia-panel-avatar" style={{ borderColor: activePersona.color }}>
                <Image src="/luxedia-avatar.png" alt={activePersona.name} width={42} height={42} />
              </div>
              <div>
                <p className="luxedia-panel-name">{activePersona.name}</p>
                <div className="luxedia-panel-status">
                  <span className="luxedia-panel-dot" />
                  {t('En ligne', 'Online')}
                </div>
              </div>
            </div>

            <div className="luxedia-panel-body">
              <div className="luxedia-panel-msg luxedia-panel-msg-user" style={{ backgroundColor: activePersona.color }}>
                {t(activePersona.questionFr, activePersona.questionEn)}
              </div>
              <div className="luxedia-panel-msg luxedia-panel-msg-ai" style={{ borderLeftColor: activePersona.color }}>
                {t(activePersona.answerFr, activePersona.answerEn)}
              </div>
            </div>

            <div className="luxedia-panel-input">
              <span className="luxedia-panel-placeholder">{t('Posez votre question…', 'Ask your question…')}</span>
              <span className="luxedia-panel-send" style={{ backgroundColor: activePersona.color }}>
                <Send size={13} color="#0B0B0B" />
              </span>
            </div>
          </motion.div>
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

      {/* ── Fil doré en écho — amorce la continuité vers Comment ça marche.
           Indépendant : aucun état ni composant partagé avec CommentCaMarche.tsx,
           l'alignement (left:50%) est garanti par la géométrie des deux sections
           pleine largeur, pas par une coordination en code. Fondu d'opacité pur,
           sans variation de longueur, pour rester discret. ── */}
      <motion.div
        aria-hidden="true"
        className="luxedia-thread"
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
        .luxedia-label {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 20px;
        }

        .luxedia-label::after {
          content: '_';
          animation: luxedia-blink 1.1s step-end infinite;
        }

        @keyframes luxedia-blink {
          50% { opacity: 0; }
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
          color: ${colors.gold};
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
          background: rgba(200,164,93,0.10);
          border: 1px solid rgba(200,164,93,0.28);
          color: rgba(247,245,242,0.88);
          font-size: 13px;
          font-weight: 500;
        }

        .luxedia-cap-icon {
          display: inline-flex;
          color: ${colors.gold};
        }

        .luxedia-demo {
          margin-top: 12px;
        }

        .luxedia-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .luxedia-tab {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .luxedia-panel {
          position: relative;
          max-width: 420px;
          margin: 0 auto;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
        }

        .luxedia-panel-tag {
          position: absolute;
          top: 14px;
          right: 16px;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247,245,242,0.35);
        }

        .luxedia-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .luxedia-panel-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid;
          overflow: hidden;
          flex-shrink: 0;
        }

        .luxedia-panel-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .luxedia-panel-name {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 4px;
        }

        .luxedia-panel-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4ade80;
        }

        .luxedia-panel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: luxedia-pulse 2s infinite;
        }

        @keyframes luxedia-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .luxedia-panel-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .luxedia-panel-msg {
          font-size: 13px;
          line-height: 1.6;
          padding: 10px 14px;
          border-radius: 12px;
          max-width: 85%;
        }

        .luxedia-panel-msg-user {
          align-self: flex-end;
          color: #0B0B0B;
          font-weight: 500;
          border-top-right-radius: 4px;
        }

        .luxedia-panel-msg-ai {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          border-left: 3px solid;
          color: rgba(247,245,242,0.85);
          border-top-left-radius: 4px;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 12.5px;
        }

        .luxedia-panel-input {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 20px 20px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .luxedia-panel-placeholder {
          flex: 1;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 12px;
          color: rgba(247,245,242,0.3);
        }

        .luxedia-panel-send {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
          .luxedia-panel {
            max-width: 100%;
          }
          .luxedia-tabs {
            flex-wrap: wrap;
          }
          .luxedia-thread {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
