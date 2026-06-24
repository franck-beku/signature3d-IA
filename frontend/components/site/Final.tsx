'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { leadsApi, projectsApi } from '@/lib/api';

const GOLD = '#C8A45D';
const WHITE = '#FCFBF8';
const CREAM = '#F7F5F2';
const INK = '#101010';
const MUTED = '#6B6458';
const BORDER = '#E2D8C8';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const FALLBACK_SLUG = 'mercedes-voiture-1';

const qrSrc = (slug: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=${encodeURIComponent(
    `${SITE_URL}/embed/${slug}`
  )}`;

const LAPTOP_SCREEN = '/assets/univers/immobilier.jpg';
const PHONE_SCREEN = '/assets/univers/auto.jpg';

export default function ContactFinal() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const h2InView = useInView(h2Ref, { once: true, margin: '-80px' });
  const [open, setOpen] = useState(false);
  const [featuredSlug, setFeaturedSlug] = useState(FALLBACK_SLUG);

  useEffect(() => {
    projectsApi
      .getFeatured()
      .then((projects) => {
        if (projects && projects.length > 0 && projects[0].slug) {
          setFeaturedSlug(projects[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: {
            duration: 0.85,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
          viewport: { once: true, margin: '-80px' },
        };

  return (
    <section
      id="contact-final"
      style={{
        background:
          'radial-gradient(circle at 84% 9%, rgba(200,164,93,0.12) 0%, transparent 28%), linear-gradient(180deg, #FCFBF8 0%, #FFFFFF 50%, #F7F5F2 100%)',
        color: INK,
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-80px',
          top: '40px',
          width: '280px',
          height: '340px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,164,93,0.14) 0%, transparent 68%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div className="final-wrap">
        <div className="final-grid">
          <motion.div {...fade(0)} className="final-copy">
            <p className="final-eyebrow">
              ✦ {t('Prêt à transformer votre espace ?', 'Ready to transform your space?')}
            </p>

            <h2 ref={h2Ref}>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={{ clipPath: 'inset(100% 0 0 0)' }}
                  animate={h2InView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                >
                  {t('Parlons de', "Let's talk about")}
                </motion.span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={{ clipPath: 'inset(100% 0 0 0)' }}
                  animate={h2InView ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
                >
                  <span>{t('votre projet.', 'your project.')}</span>
                </motion.span>
              </span>
            </h2>

            <div className="final-line" />

            <p className="final-lead">
              {t(
                'Découvrez comment nous créons des expériences immersives qui valorisent votre espace, captivent vos visiteurs et génèrent des résultats.',
                'Discover how we create immersive experiences that showcase your space, captivate visitors and generate results.'
              )}
            </p>

            <button onClick={() => setOpen(true)} className="final-cta">
              {t('Demander une démonstration', 'Request a demonstration')}
              <span>→</span>
            </button>

            <p className="final-note">
              {t(
                'Réponse sous 24h avec une proposition personnalisée.',
                'Response within 24h with a personalized proposal.'
              )}
            </p>
          </motion.div>

          <motion.div {...fade(0.12)} className="final-visual">
            <LaptopMockup screen={LAPTOP_SCREEN} t={t} />
            <PhoneMockup screen={PHONE_SCREEN} t={t} />
          </motion.div>

          <motion.div {...fade(0.22)} className="final-qr">
            <QrCard t={t} slug={featuredSlug} />
          </motion.div>
        </div>

        <motion.div {...fade(0.32)} className="final-contact-bar">
          <ContactItem
            icon={<Phone size={28} />}
            label={t('Appelez-nous', 'Call us')}
            value="+1 (819) 000-0000"
          />
          <ContactItem
            icon={<Mail size={30} />}
            label={t('Écrivez-nous', 'Email us')}
            value="info@signatureimmersion.ca"
          />
          <ContactItem
            icon={<MapPin size={31} />}
            label={t('Notre localisation', 'Our location')}
            value="Trois-Rivières, Québec"
          />
        </motion.div>

        <motion.p {...fade(0.42)} className="final-bottom-note">
          {t(
            'Lien unique, QR code et Luxedia intégrés pour une expérience complète.',
            'Unique link, QR code and Luxedia included for a complete experience.'
          )}
        </motion.p>

        <motion.div {...fade(0.48)} className="final-bottom-line">
          <span />
          ✦
          <span />
        </motion.div>
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} reduce={!!reduce} t={t} />

      <style>{`
        .final-wrap {
          position: relative;
          z-index: 1;
          max-width: 1580px;
          margin: 0 auto;
          padding: 152px 54px 112px;
        }

        .final-grid {
          display: grid;
          grid-template-columns: 0.7fr 1.42fr 0.58fr;
          gap: 24px;
          align-items: center;
        }

        .final-copy {
          max-width: 430px;
        }

        .final-eyebrow {
          margin: 0 0 28px;
          color: ${GOLD};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          line-height: 1.8;
        }

        .final-copy h2 {
          margin: 0;
          font-family: var(--font-cormorant), serif;
          font-size: clamp(4.2rem, 6vw, 6.9rem);
          font-weight: 400;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: ${INK};
        }

        .final-copy h2 span {
          color: ${GOLD};
          font-style: italic;
        }

        .final-line {
          width: 64px;
          height: 1px;
          background: ${GOLD};
          margin: 34px 0 34px;
        }

        .final-lead {
          margin: 0 0 34px;
          max-width: 430px;
          color: ${MUTED};
          font-size: 16.5px;
          line-height: 1.85;
        }

        .final-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: ${GOLD};
          color: #FFFFFF;
          border: none;
          border-radius: 7px;
          padding: 19px 40px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          box-shadow: 0 18px 46px -18px rgba(200,164,93,0.65);
        }

        .final-cta:hover {
          background: ${INK};
          transform: translateY(-3px);
          box-shadow: 0 24px 60px -20px rgba(0,0,0,0.32);
        }

        .final-note {
          margin-top: 22px;
          color: rgba(16,16,16,0.46);
          font-size: 14px;
          line-height: 1.7;
        }

        .final-visual {
          position: relative;
          min-height: 590px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .final-qr {
          display: flex;
          justify-content: flex-start;
          transform: translateX(-8px);
        }

        .final-contact-bar {
          margin: 48px auto 0;
          max-width: 1160px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(255,255,255,0.64);
          border: 1px solid rgba(226,216,200,0.82);
          border-radius: 18px;
          box-shadow: 0 24px 80px -50px rgba(0,0,0,0.22);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .contact-bar-item {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 30px 40px;
          border-right: 1px solid rgba(226,216,200,0.85);
        }

        .contact-bar-item:last-child {
          border-right: none;
        }

        .contact-bar-icon {
          color: ${GOLD};
          flex-shrink: 0;
        }

        .contact-bar-label {
          margin: 0 0 7px;
          color: ${MUTED};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .contact-bar-value {
          margin: 0;
          color: ${INK};
          font-size: 17px;
          font-weight: 500;
        }

        .final-bottom-note {
          margin: 30px auto 0;
          text-align: center;
          color: rgba(16,16,16,0.48);
          font-size: 15px;
          line-height: 1.7;
        }

        .final-bottom-line {
          margin: 28px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: ${GOLD};
        }

        .final-bottom-line span {
          width: 72px;
          height: 1px;
          background: rgba(200,164,93,0.45);
        }

        @media (max-width: 1240px) {
          .final-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .final-copy {
            max-width: 660px;
            margin: 0 auto;
          }

          .final-line {
            margin-left: auto;
            margin-right: auto;
          }

          .final-lead {
            margin-left: auto;
            margin-right: auto;
          }

          .final-visual {
            min-height: 560px;
          }

          .final-qr {
            justify-content: center;
            transform: none;
          }

          .final-contact-bar {
            grid-template-columns: 1fr;
          }

          .contact-bar-item {
            border-right: none;
            border-bottom: 1px solid rgba(226,216,200,0.85);
            justify-content: center;
            text-align: left;
          }

          .contact-bar-item:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 720px) {
          .final-wrap {
            padding: 88px 22px 72px;
          }

          .final-copy h2 {
            font-size: clamp(3rem, 15vw, 4.7rem);
          }

          .final-visual {
            min-height: 455px;
          }

          .final-contact-bar {
            margin-top: 48px;
          }

          .contact-bar-item {
            padding: 24px;
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="contact-bar-item">
      <div className="contact-bar-icon">{icon}</div>
      <div>
        <p className="contact-bar-label">{label}</p>
        <p className="contact-bar-value">{value}</p>
      </div>
    </div>
  );
}

function LaptopMockup({
  screen,
  t,
}: {
  screen: string;
  t: (fr: string, en: string) => string;
}) {
  return (
    <div className="laptop-shell">
      <div className="laptop-glow" />

      <div className="laptop-screen">
        <img src={screen} alt={t('Aperçu Matterport', 'Matterport preview')} />
        <div className="laptop-overlay" />

        <div className="laptop-topbar">
          <div className="laptop-logo">
            <span>S</span>
            <p>
              Signature
              <br />
              Immersion
            </p>
          </div>

          <div className="laptop-nav">
            <span>{t('Accueil', 'Home')}</span>
            <span>{t('Galerie', 'Gallery')}</span>
            <span>{t('Informations', 'Information')}</span>
          </div>

          <div className="laptop-menu">☰</div>
        </div>

        <button className="laptop-play" aria-label={t('Lancer la visite', 'Start the tour')}>
          ▶
        </button>

        <div className="matterport-controls">
          <span>▶</span>
          <span>›</span>
          <span>⌂</span>
          <span>◎</span>
          <span>…</span>
        </div>

        <div className="matterport-powered">Powered by Matterport</div>
        <div className="matterport-room">{t('Salon principal', 'Main room')}</div>
      </div>

      <div className="laptop-base" />

      <style>{`
        .laptop-shell {
          position: relative;
          width: min(820px, 100%);
          transform: rotate(-1deg) translateX(14px);
        }

        .laptop-glow {
          position: absolute;
          inset: 8% 2%;
          background: radial-gradient(circle at 50% 50%, rgba(200,164,93,0.22), transparent 62%);
          filter: blur(48px);
          pointer-events: none;
        }

        .laptop-screen {
          position: relative;
          overflow: hidden;
          border-radius: 22px 22px 10px 10px;
          aspect-ratio: 16 / 10;
          background: #0B0B0B;
          border: 13px solid #0C0C0C;
          box-shadow: 0 46px 94px -36px rgba(0,0,0,0.62);
        }

        .laptop-screen img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.78) saturate(0.9);
        }

        .laptop-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(11,11,11,0.56) 0%, transparent 36%, rgba(11,11,11,0.58) 100%);
        }

        .laptop-topbar {
          position: absolute;
          z-index: 4;
          left: 28px;
          right: 28px;
          top: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
        }

        .laptop-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .laptop-logo span {
          color: ${GOLD};
          font-family: var(--font-cormorant), serif;
          font-size: 30px;
          line-height: 1;
        }

        .laptop-logo p {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .laptop-nav {
          display: flex;
          gap: 30px;
          color: rgba(255,255,255,0.82);
          font-size: 13px;
        }

        .laptop-menu {
          font-size: 20px;
          color: rgba(255,255,255,0.82);
        }

        .laptop-play {
          position: absolute;
          z-index: 5;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.18);
          color: #FFFFFF;
          backdrop-filter: blur(4px);
          cursor: pointer;
        }

        .matterport-controls {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 48px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 16px 30px;
          border-radius: 999px;
          background: rgba(11,11,11,0.8);
          color: #FFFFFF;
          font-size: 15px;
          backdrop-filter: blur(8px);
        }

        .matterport-powered {
          position: absolute;
          z-index: 4;
          left: 28px;
          bottom: 34px;
          color: rgba(255,255,255,0.86);
          font-size: 12px;
          font-weight: 600;
        }

        .matterport-room {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.65);
          font-size: 12px;
        }

        .laptop-base {
          width: 92%;
          height: 24px;
          margin: 0 auto;
          border-radius: 0 0 34px 34px;
          background: linear-gradient(180deg, #474747 0%, #161616 100%);
          box-shadow: 0 26px 58px -38px rgba(0,0,0,0.86);
        }

        @media (max-width: 720px) {
          .laptop-shell {
            width: 100%;
            transform: rotate(-1deg);
          }

          .laptop-nav {
            display: none;
          }

          .laptop-screen {
            border-width: 8px;
          }

          .laptop-logo p {
            font-size: 11px;
          }

          .laptop-play {
            width: 44px;
            height: 44px;
          }

          .matterport-controls {
            gap: 14px;
            padding: 12px 18px;
            bottom: 34px;
          }

          .matterport-powered,
          .matterport-room {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function PhoneMockup({
  screen,
  t,
}: {
  screen: string;
  t: (fr: string, en: string) => string;
}) {
  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className="phone-screen">
          <img src={screen} alt={t('Interface Luxedia', 'Luxedia interface')} />

          <div className="phone-overlay" />
          <div className="phone-notch" />

          <div className="phone-brand">
            <span>Luxedia</span>
            <span>≡</span>
          </div>

          <div className="phone-title">
            {t(
              'Bienvenue dans votre expérience interactive',
              'Welcome to your interactive experience'
            )}
          </div>

          <p className="phone-subtitle">
            {t(
              'Posez vos questions et découvrez chaque détail de cet espace.',
              'Ask questions and discover every detail of this space.'
            )}
          </p>

          <div className="phone-chat">
            <span>{t('Posez votre question...', 'Ask your question...')}</span>
            <button>➤</button>
          </div>

          <p className="phone-powered">
            {t('Propulsé par Luxedia', 'Powered by Luxedia')}
          </p>
        </div>
      </div>

      <style>{`
        .phone-shell {
          position: absolute;
          z-index: 8;
          right: 18px;
          bottom: 52px;
        }

        .phone-frame {
          width: 220px;
          border-radius: 2.45rem;
          padding: 3px;
          background: linear-gradient(160deg, ${GOLD} 0%, #7a4f12 42%, #2a1c08 100%);
          box-shadow: 0 38px 82px -28px rgba(0,0,0,0.62);
        }

        .phone-screen {
          position: relative;
          overflow: hidden;
          border-radius: 2.3rem;
          background: #0B0B0B;
          aspect-ratio: 9 / 19.5;
        }

        .phone-screen img {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
          filter: brightness(0.48) saturate(0.9);
        }

        .phone-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(11,11,11,0.72) 0%,
            rgba(11,11,11,0.42) 40%,
            rgba(11,11,11,0.94) 100%
          );
        }

        .phone-notch {
          position: absolute;
          left: 50%;
          top: 10px;
          z-index: 20;
          height: 20px;
          width: 82px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: #0B0B0B;
        }

        .phone-brand {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 58px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .phone-brand span:first-child::before {
          content: 'S';
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          border-radius: 50%;
          background: ${GOLD};
          color: #FFFFFF;
          font-family: var(--font-cormorant), serif;
          font-size: 13px;
          letter-spacing: 0;
        }

        .phone-title {
          position: absolute;
          z-index: 10;
          left: 18px;
          right: 18px;
          top: 154px;
          color: #FFFFFF;
          font-family: var(--font-cormorant), serif;
          font-size: 25px;
          line-height: 1.12;
          font-weight: 400;
        }

        .phone-subtitle {
          position: absolute;
          z-index: 10;
          left: 18px;
          right: 18px;
          top: 260px;
          color: rgba(255,255,255,0.74);
          font-size: 10px;
          line-height: 1.65;
          margin: 0;
        }

        .phone-chat {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 50px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 999px;
          padding: 9px 9px 9px 13px;
          background: rgba(20,20,20,0.86);
          border: 1px solid rgba(200,164,93,0.46);
        }

        .phone-chat span {
          color: rgba(255,255,255,0.6);
          font-size: 9px;
        }

        .phone-chat button {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: ${GOLD};
          color: #FFFFFF;
          font-size: 10px;
        }

        .phone-powered {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 27px;
          z-index: 10;
          text-align: center;
          color: rgba(255,255,255,0.42);
          font-size: 8px;
          letter-spacing: 0.08em;
          margin: 0;
        }

        @media (max-width: 720px) {
          .phone-shell {
            width: 150px;
            right: 0;
            bottom: 34px;
          }

          .phone-frame {
            width: 150px;
          }

          .phone-title {
            top: 105px;
            font-size: 18px;
          }

          .phone-subtitle {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function QrCard({
  t,
  slug,
}: {
  t: (fr: string, en: string) => string;
  slug: string;
}) {
  return (
    <div className="qr-card">
      <div className="qr-star">✦</div>

      <p className="qr-heading">{t('Scannez pour visiter', 'Scan to visit')}</p>

      <div className="qr-wrap">
        <img src={qrSrc(slug)} alt={t("QR code vers l'expérience", 'QR code to the experience')} />

        <div className="qr-center">
          <span>S</span>
        </div>
      </div>

      <p className="qr-title">{t('Découvrez chaque détail', 'Discover every detail')}</p>
      <span>{t('de cette expérience en temps réel.', 'of this experience in real time.')}</span>

      <div className="qr-line" />

      <style>{`
        .qr-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 2rem;
          background: rgba(255,255,255,0.76);
          padding: 42px 32px;
          box-shadow: 0 38px 90px -42px rgba(0,0,0,0.32);
          border: 1px solid rgba(226,216,200,0.92);
          backdrop-filter: blur(8px);
          min-width: 270px;
        }

        .qr-star {
          margin-bottom: 18px;
          color: ${GOLD};
          font-size: 23px;
        }

        .qr-heading {
          margin: 0 0 24px;
          color: ${INK};
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .qr-wrap {
          position: relative;
        }

        .qr-wrap img {
          width: 218px;
          height: 218px;
          display: block;
        }

        .qr-center {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          height: 46px;
          width: 46px;
          transform: translate(-50%, -50%);
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1.5px solid ${GOLD};
        }

        .qr-center span {
          font-family: var(--font-cormorant), serif;
          color: ${GOLD};
          font-size: 21px;
        }

        .qr-title {
          margin: 26px 0 6px;
          color: ${INK};
          font-size: 15.5px;
          font-weight: 800;
          text-align: center;
        }

        .qr-card > span {
          color: ${MUTED};
          font-size: 13px;
          line-height: 1.65;
          text-align: center;
          max-width: 210px;
        }

        .qr-line {
          margin-top: 24px;
          height: 1px;
          width: 54px;
          background: ${GOLD};
        }

        @media (max-width: 720px) {
          .qr-card {
            min-width: 0;
            width: 100%;
            max-width: 300px;
          }

          .qr-wrap img {
            width: 185px;
            height: 185px;
          }
        }
      `}</style>
    </div>
  );
}

function ContactModal({
  open,
  onClose,
  reduce,
  t,
}: {
  open: boolean;
  onClose: () => void;
  reduce: boolean;
  t: (fr: string, en: string) => string;
}) {
  const [form, setForm] = useState({ nom: '', contact: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    const tmo = setTimeout(() => firstRef.current?.focus(), 80);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(tmo);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const tmo = setTimeout(() => {
        setSent(false);
        setError(null);
        setLoading(false);
        setForm({ nom: '', contact: '', message: '' });
      }, 300);

      return () => clearTimeout(tmo);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.nom.trim() || !form.contact.trim()) {
      setError(
        t(
          'Merci de renseigner votre nom et un moyen de contact.',
          'Please provide your name and a way to reach you.'
        )
      );
      return;
    }

    setError(null);
    setLoading(true);

    const contact = form.contact.trim();
    const isEmail = contact.includes('@');

    try {
      await leadsApi.create({
        name: form.nom.trim(),
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
        message: form.message.trim() || undefined,
        buttonLabel: 'Demander une démonstration',
      });

      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t('Une erreur est survenue. Réessayez.', 'Something went wrong. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const dur = reduce ? 0 : 0.35;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="contact-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('Formulaire de contact', 'Contact form')}
        >
          <div className="contact-modal-backdrop" />

          <motion.div
            className="contact-modal-card"
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} aria-label={t('Fermer', 'Close')} className="modal-close">
              ✕
            </button>

            {!sent ? (
              <>
                <h3>{t('Parlez-nous de votre espace.', 'Tell us about your space.')}</h3>

                <p className="modal-intro">
                  {t(
                    'Nous vous répondrons avec une proposition adaptée.',
                    "We'll get back to you with a tailored proposal."
                  )}
                </p>

                <div className="modal-fields">
                  <Field
                    ref={firstRef}
                    label={t('Nom', 'Name')}
                    value={form.nom}
                    onChange={(v) => setForm({ ...form, nom: v })}
                    placeholder={t('Votre nom', 'Your name')}
                  />

                  <Field
                    label={t('Courriel ou téléphone', 'Email or phone')}
                    value={form.contact}
                    onChange={(v) => setForm({ ...form, contact: v })}
                    placeholder={t('Pour vous recontacter', 'So we can reach you')}
                  />

                  <Field
                    label={t('Message', 'Message')}
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    placeholder={t('En quelques mots...', 'In a few words...')}
                    textarea
                  />
                </div>

                {error && <p className="modal-error">{error}</p>}

                <button onClick={handleSubmit} disabled={loading} className="modal-submit">
                  {loading
                    ? t('Envoi...', 'Sending...')
                    : t('Demander une démonstration', 'Request a demonstration')}
                </button>
              </>
            ) : (
              <div className="modal-success">
                <div>✓</div>
                <h3>{t('Message reçu.', 'Message received.')}</h3>
                <p>
                  {t(
                    'Merci. Nous revenons vers vous très vite avec une proposition adaptée.',
                    "Thank you. We'll be in touch shortly with a tailored proposal."
                  )}
                </p>
                <button onClick={onClose}>{t('Fermer', 'Close')}</button>
              </div>
            )}
          </motion.div>

          <style>{`
            .contact-modal-root {
              position: fixed;
              inset: 0;
              z-index: 100;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 16px;
            }

            .contact-modal-backdrop {
              position: absolute;
              inset: 0;
              background: rgba(11,11,11,0.55);
              backdrop-filter: blur(4px);
            }

            .contact-modal-card {
              position: relative;
              width: 100%;
              max-width: 440px;
              overflow: hidden;
              border-radius: 28px;
              background: ${CREAM};
              padding: 36px;
              box-shadow: 0 34px 90px -36px rgba(0,0,0,0.36);
            }

            .modal-close {
              position: absolute;
              right: 20px;
              top: 20px;
              width: 34px;
              height: 34px;
              border: none;
              border-radius: 50%;
              background: transparent;
              color: ${MUTED};
              cursor: pointer;
            }

            .contact-modal-card h3 {
              font-family: var(--font-cormorant), serif;
              color: ${INK};
              font-size: 2rem;
              line-height: 1.1;
              font-weight: 500;
              margin: 0;
            }

            .modal-intro {
              margin-top: 14px;
              color: ${MUTED};
              font-size: 14px;
              line-height: 1.7;
            }

            .modal-fields {
              margin-top: 26px;
              display: grid;
              gap: 16px;
            }

            .modal-error {
              margin-top: 16px;
              color: #B4232A;
              font-size: 14px;
            }

            .modal-submit {
              margin-top: 26px;
              width: 100%;
              border: none;
              border-radius: 7px;
              background: ${GOLD};
              color: #FFFFFF;
              padding: 15px 18px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.08em;
              transition: all 0.3s ease;
            }

            .modal-submit:hover {
              background: ${INK};
              color: #FFFFFF;
            }

            .modal-success {
              padding: 20px 0;
              text-align: center;
            }

            .modal-success > div {
              margin: 0 auto 18px;
              display: flex;
              height: 56px;
              width: 56px;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: rgba(200,164,93,0.14);
              color: ${GOLD};
              font-size: 28px;
            }

            .modal-success p {
              margin: 14px auto 0;
              max-width: 320px;
              color: ${MUTED};
              font-size: 14px;
              line-height: 1.7;
            }

            .modal-success button {
              margin-top: 26px;
              border: none;
              background: transparent;
              color: ${GOLD};
              font-weight: 700;
              cursor: pointer;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Field = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    textarea?: boolean;
  }
>(function Field({ label, value, onChange, placeholder, textarea }, ref) {
  const base =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[#C8A45D]';

  return (
    <label className="block">
      <span className="field-label">{label}</span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={base}
          style={{
            borderColor: 'rgba(0,0,0,0.12)',
            color: INK,
            resize: 'none',
          }}
        />
      ) : (
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
          style={{
            borderColor: 'rgba(0,0,0,0.12)',
            color: INK,
          }}
        />
      )}

      <style>{`
        .field-label {
          display: block;
          margin-bottom: 6px;
          color: ${MUTED};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>
    </label>
  );
});