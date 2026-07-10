'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { projectsApi, type ProjectCardDto } from '@/lib/api';
import { colors } from '@/config/theme';

function getMatterportThumb(matterportId?: string): string | null {
  if (!matterportId) return null;
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb?width=1200&dpr=1&disable=upscale`;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=85&auto=format&fit=crop';

export default function RealisationsVedettes() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<ProjectCardDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    projectsApi
      .getFeatured()
      .then((res) => {
        if (active && Array.isArray(res)) setProjects(res.slice(0, 4));
      })
      .catch(() => { /* silencieux — pas de repli fictif, voir plus bas */ })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Section honnête : rien à afficher tant qu'aucun vrai projet n'est marqué "à la une".
  if (!loading && projects.length === 0) return null;

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
      aria-label={t('Réalisations récentes', 'Recent work')}
      style={{
        backgroundColor: colors.white,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '150px 32px' }} className="rv-wrap">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          className="rv-header"
        >
          <div>
            <motion.p variants={item} className="rv-label">
              {t('Réalisations récentes', 'Recent work')}
            </motion.p>
            <motion.h2 variants={item} className="rv-title">
              {t('Des projets concrets,', 'Concrete projects,')}
              <br />
              <span>{t('des expériences qui marquent.', 'experiences that resonate.')}</span>
            </motion.h2>
          </div>

          <motion.div variants={item}>
            <Link href="/realisations" className="rv-all-link">
              {t('Voir toutes nos réalisations', 'View all our work')}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.muted, fontSize: '15px' }}>
            {t('Chargement…', 'Loading…')}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={container}
            className="rv-grid"
          >
            {projects.map((p) => {
              const image = p.coverImage || getMatterportThumb(p.matterportId) || FALLBACK_IMAGE;
              const description =
                (lang === 'en' ? p.shortDescriptionEn || p.shortDescription : p.shortDescription) ||
                t('Expérience immersive Signature.', 'Signature immersive experience.');

              return (
                <motion.div key={p.slug} variants={item} className="rv-card">
                  <div className="rv-media">
                    <img src={image} alt={p.name} className="rv-img" />
                    <div className="rv-scrim" aria-hidden="true" />

                    {p.offeringName && <span className="rv-badge-offer">{p.offeringName}</span>}

                    <span className="rv-badge-live">
                      <span className="rv-dot" />
                      Live
                    </span>

                    <Link href={`/embed/${p.slug}`} className="rv-overlay">
                      <span className="rv-overlay-btn">
                        <Play size={12} style={{ fill: '#fff' }} />
                        {t("Voir l'expérience", 'View experience')}
                      </span>
                    </Link>
                  </div>

                  <div className="rv-body">
                    <h3>{p.name}</h3>
                    <p className="rv-desc">{description}</p>

                    {p.details && p.details.length > 0 && (
                      <div className="rv-details">
                        {p.details.map((d) => (
                          <div key={d.id} className="rv-detail">
                            <span className="rv-detail-label">{d.label}</span>
                            <span className="rv-detail-value">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link href={`/embed/${p.slug}`} className="rv-link">
                      {t("Voir l'expérience", 'View experience')} <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .rv-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 32px;
          margin-bottom: 58px;
        }

        .rv-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 18px;
        }

        .rv-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
          max-width: 560px;
        }

        .rv-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .rv-all-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(200,164,93,0.7);
          color: ${colors.ink};
          background: transparent;
          border-radius: 4px;
          padding: 13px 22px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .rv-all-link:hover {
          background-color: ${colors.ink};
          color: #FFFFFF;
          border-color: ${colors.ink};
        }

        .rv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .rv-card {
          border-radius: 20px;
          overflow: hidden;
          background-color: ${colors.charcoal};
          box-shadow: 0 18px 50px -26px rgba(0,0,0,0.4);
          transition: all 0.35s ease;
        }

        .rv-card:hover {
          box-shadow: 0 28px 70px -22px rgba(0,0,0,0.5);
          transform: translateY(-4px);
        }

        .rv-media {
          position: relative;
          height: 220px;
          overflow: hidden;
          background-color: ${colors.charcoal};
        }

        .rv-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }

        .rv-card:hover .rv-img {
          transform: scale(1.04);
        }

        .rv-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11,11,11,0.7) 0%, rgba(11,11,11,0.1) 60%, transparent 100%);
        }

        .rv-badge-offer {
          position: absolute;
          top: 14px;
          left: 14px;
          border-radius: 999px;
          background-color: rgba(200,164,93,0.92);
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #FFFFFF;
        }

        .rv-badge-live {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background-color: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
        }

        .rv-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #22C55E;
          animation: rv-pulse 2s infinite;
        }

        @keyframes rv-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .rv-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          background-color: rgba(0,0,0,0.3);
          text-decoration: none;
        }

        .rv-card:hover .rv-overlay {
          opacity: 1;
        }

        .rv-overlay-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          background-color: ${colors.gold};
          padding: 11px 22px;
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .rv-body {
          padding: 18px 20px;
          background-color: ${colors.charcoal};
        }

        .rv-body h3 {
          font-family: var(--font-cormorant), serif;
          font-size: 1.4rem;
          font-weight: 500;
          color: #FFFFFF;
          margin: 0 0 4px;
        }

        .rv-desc {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255,255,255,0.5);
          margin: 0 0 14px;
        }

        .rv-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .rv-detail {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          border-radius: 10px;
          background-color: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .rv-detail-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.35);
        }

        .rv-detail-value {
          font-size: 14px;
          font-weight: 700;
          color: ${colors.gold};
          line-height: 1.3;
        }

        .rv-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: ${colors.gold};
          text-decoration: none;
          transition: gap 0.2s ease;
        }

        .rv-card:hover .rv-link {
          gap: 10px;
        }

        @media (max-width: 760px) {
          .rv-wrap {
            padding: 110px 24px !important;
          }
          .rv-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
