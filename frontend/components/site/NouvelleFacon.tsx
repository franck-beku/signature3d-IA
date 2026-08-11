'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, QrCode, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

type Feature = {
  key: string;
  isAi?: boolean;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
};

const FEATURES: Feature[] = [
  {
    key: 'visites',
    titleFr: 'Visites immersives 3D & 360°',
    titleEn: 'Immersive 3D & 360° tours',
    descFr: 'Explorez chaque espace comme si vous y étiez, sur ordinateur, mobile ou tablette.',
    descEn: 'Explore every space as if you were there — on desktop, mobile, or tablet.',
  },
  {
    key: 'luxedia',
    isAi: true,
    titleFr: 'Luxedia, votre assistant IA',
    titleEn: 'Luxedia, your AI assistant',
    descFr: 'Répond aux visiteurs, présente vos services et vous aide à générer des prospects, 24h/24.',
    descEn: 'Answers visitors, showcases your services, and helps you generate leads, 24/7.',
  },
  {
    key: 'diffusion',
    titleFr: 'Diffusion & visibilité',
    titleEn: 'Distribution & visibility',
    descFr: 'Partagez votre visite via un lien, un QR Code ou Google Street View.',
    descEn: 'Share your tour via a link, a QR code, or Google Street View.',
  },
];

/* Miniature d'une vraie visite Matterport (Mercedes Showroom) — même API que RealisationsVedettes
   /Final. Volontairement en <img> brut, pas next/image : my.matterport.com n'est pas dans
   images.remotePatterns (next.config.ts). */
const VISITES_THUMB_URL =
  'https://my.matterport.com/api/v1/player/models/Fg8etsLyrWz/thumb?width=1200&dpr=1&disable=upscale';

/* Motif décoratif façon QR code (9x9, avec les 3 carrés de repérage typiques) — purement
   illustratif, jamais destiné à être scanné. */
const QR_PATTERN = [
  '111010111',
  '101011101',
  '101010101',
  '111010111',
  '000011000',
  '110100011',
  '101011101',
  '101010001',
  '111011101',
];

export default function NouvelleFacon() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);

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
          className="nf-split"
        >
          <div className="nf-selector">
            {FEATURES.map((f, i) => (
              <motion.button
                key={f.key}
                type="button"
                variants={item}
                className="nf-row"
                data-active={i === active}
                aria-pressed={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="nf-row-index">0{i + 1}</span>
                <div className="nf-row-text">
                  {f.isAi && (
                    <span className="nf-badge">
                      {t('Intelligence artificielle', 'Artificial intelligence')}
                    </span>
                  )}
                  <h3>{t(f.titleFr, f.titleEn)}</h3>
                  <p className="nf-desc">{t(f.descFr, f.descEn)}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div variants={item} className="nf-preview">
            <AnimatePresence mode="wait">
              {active === 0 && (
                <motion.div
                  key="visites"
                  className="nf-preview-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    href="/embed/mercedes-voiture-2"
                    className="nf-preview-link"
                    aria-label={t('Voir la visite Mercedes Showroom', 'View the Mercedes Showroom tour')}
                  >
                    <img src={VISITES_THUMB_URL} alt="" className="nf-preview-img" />
                    <div className="nf-preview-scrim" aria-hidden="true" />
                    <span className="nf-preview-tag">
                      <span className="nf-preview-dot" />
                      {t('Visite en direct', 'Live tour')}
                      <span aria-hidden="true" className="nf-preview-tag-arrow">→</span>
                    </span>
                  </Link>
                </motion.div>
              )}

              {active === 1 && (
                <motion.div
                  key="luxedia"
                  className="nf-preview-panel nf-preview-chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="nf-tag nf-tag--dark">{t('Aperçu', 'Preview')}</span>
                  <div className="nf-chat-header">
                    <div className="nf-chat-avatar">
                      <Image src="/luxedia-avatar.png" alt="Luxedia" width={36} height={36} />
                    </div>
                    <div>
                      <p className="nf-chat-name">Luxedia</p>
                      <div className="nf-chat-status">
                        <span className="nf-chat-dot" />
                        {t('En ligne', 'Online')}
                      </div>
                    </div>
                  </div>
                  <div className="nf-chat-body">
                    <div className="nf-chat-msg nf-chat-msg-user">
                      {t('Avez-vous des disponibilités cette semaine ?', 'Do you have availability this week?')}
                    </div>
                    <div className="nf-chat-msg nf-chat-msg-ai">
                      {t('Je peux vérifier ça pour vous immédiatement.', 'I can check that for you right away.')}
                    </div>
                  </div>
                </motion.div>
              )}

              {active === 2 && (
                <motion.div
                  key="diffusion"
                  className="nf-preview-panel nf-preview-share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="nf-tag nf-tag--light">{t('Aperçu', 'Preview')}</span>
                  <div className="nf-qr" aria-hidden="true">
                    {QR_PATTERN.flatMap((row, ri) =>
                      row.split('').map((cell, ci) => (
                        <span
                          key={`${ri}-${ci}`}
                          className="nf-qr-dot"
                          style={{ opacity: cell === '1' ? 1 : 0 }}
                        />
                      ))
                    )}
                  </div>
                  <div className="nf-share-channels">
                    <span className="nf-share-chip">
                      <LinkIcon size={13} /> {t('Lien', 'Link')}
                    </span>
                    <span className="nf-share-chip">
                      <QrCode size={13} /> QR Code
                    </span>
                    <span className="nf-share-chip">
                      <MapPin size={13} /> Street View
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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

        .nf-split {
          display: grid;
          grid-template-columns: 5fr 6fr;
          gap: 56px;
          align-items: stretch;
        }

        .nf-selector {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .nf-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-left: 2px solid transparent;
          cursor: pointer;
          padding: 22px 8px 22px 20px;
          opacity: 0.55;
          transition: opacity 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
        }

        .nf-row[data-active="true"] {
          opacity: 1;
          border-left-color: ${colors.gold};
          background: rgba(200,164,93,0.05);
        }

        .nf-row-index {
          flex-shrink: 0;
          width: 26px;
          padding-top: 3px;
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 15px;
          color: ${colors.gold};
        }

        .nf-badge {
          display: inline-block;
          margin-bottom: 10px;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgba(200,164,93,0.08);
          color: ${colors.gold};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .nf-row h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.25rem, 1.8vw, 1.5rem);
          font-weight: 500;
          color: ${colors.ink};
          margin: 0 0 8px;
        }

        .nf-desc {
          font-size: 14px;
          line-height: 1.65;
          color: ${colors.muted};
          margin: 0;
        }

        .nf-preview {
          position: relative;
          min-height: 460px;
          border-radius: 20px;
          overflow: hidden;
          background: ${colors.cream};
          border: 1px solid ${colors.border};
        }

        .nf-preview-panel {
          position: absolute;
          inset: 0;
        }

        .nf-preview-link {
          position: absolute;
          inset: 0;
          display: block;
          text-decoration: none;
        }

        .nf-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }

        .nf-preview-link:hover .nf-preview-img {
          transform: scale(1.04);
        }

        .nf-preview-tag-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
        }

        .nf-preview-link:hover .nf-preview-tag-arrow {
          transform: translateX(3px);
        }

        .nf-preview-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11,11,11,0.6) 0%, transparent 55%);
        }

        .nf-preview-tag {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.15);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 500;
        }

        .nf-preview-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22C55E;
        }

        .nf-tag {
          position: absolute;
          top: 16px;
          right: 18px;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .nf-tag--dark {
          color: rgba(247,245,242,0.35);
        }

        .nf-tag--light {
          color: ${colors.muted};
        }

        .nf-preview-chat {
          display: flex;
          flex-direction: column;
          padding: 28px;
          background: ${colors.charcoal};
        }

        .nf-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .nf-chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid rgba(200,164,93,0.5);
          flex-shrink: 0;
        }

        .nf-chat-name {
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 4px;
        }

        .nf-chat-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4ade80;
        }

        .nf-chat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
        }

        .nf-chat-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nf-chat-msg {
          font-size: 13px;
          line-height: 1.6;
          padding: 10px 14px;
          border-radius: 12px;
          max-width: 82%;
        }

        .nf-chat-msg-user {
          align-self: flex-end;
          background: ${colors.gold};
          color: ${colors.charcoal};
          font-weight: 500;
          border-top-right-radius: 4px;
        }

        .nf-chat-msg-ai {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          color: rgba(247,245,242,0.85);
          border-top-left-radius: 4px;
        }

        .nf-preview-share {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 28px;
          background: ${colors.white};
        }

        .nf-qr {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 3px;
          width: 140px;
          height: 140px;
        }

        .nf-qr-dot {
          background: ${colors.ink};
          border-radius: 1px;
        }

        .nf-share-channels {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .nf-share-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(200,164,93,0.08);
          border: 1px solid rgba(200,164,93,0.25);
          color: ${colors.ink};
          font-size: 12px;
          font-weight: 500;
        }

        .nf-share-chip svg {
          color: ${colors.gold};
        }

        @media (max-width: 900px) {
          .nf-split {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }

          .nf-preview {
            order: -1;
            min-height: 320px;
          }
        }
      `}</style>
    </section>
  );
}
