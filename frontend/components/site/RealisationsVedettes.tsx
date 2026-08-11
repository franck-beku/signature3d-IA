'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { projectsApi, type ProjectCardDto } from '@/lib/api';
import { colors } from '@/config/theme';

function getMatterportThumb(matterportId?: string): string | null {
  if (!matterportId) return null;
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb?width=1600&dpr=1&disable=upscale`;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=85&auto=format&fit=crop';

export default function RealisationsVedettes() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<ProjectCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  useEffect(() => {
    let active = true;
    projectsApi
      .getFeatured()
      .then((res) => {
        // Plus de .slice() — le carousel n'a pas besoin d'être plafonné comme l'était la grille.
        if (active && Array.isArray(res)) setProjects(res);
      })
      .catch(() => { /* silencieux — pas de repli fictif, voir plus bas */ })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const count = projects.length;

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Section honnête : rien à afficher tant qu'aucun vrai projet n'est marqué "à la une".
  if (!loading && count === 0) return null;

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

  const current = projects[index];
  const image = current
    ? current.coverImage || getMatterportThumb(current.matterportId) || FALLBACK_IMAGE
    : null;
  const description = current
    ? (lang === 'en' ? current.shortDescriptionEn || current.shortDescription : current.shortDescription) ||
      t('Expérience immersive Signature.', 'Signature immersive experience.')
    : '';

  return (
    <section
      id="realisations-recentes"
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
            <h2 ref={titleRef} className="rv-title">
              <span className="rv-title-line">
                <motion.span
                  className="rv-title-line-inner"
                  initial={reduceMotion ? { opacity: 1 } : { clipPath: 'inset(100% 0 0 0)' }}
                  animate={
                    titleInView
                      ? reduceMotion
                        ? { opacity: 1 }
                        : { clipPath: 'inset(0% 0 0 0)' }
                      : undefined
                  }
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.1 }}
                >
                  {t('Des projets concrets,', 'Concrete projects,')}
                </motion.span>
              </span>
              <span className="rv-title-line">
                <motion.span
                  className="rv-title-line-inner"
                  initial={reduceMotion ? { opacity: 1 } : { clipPath: 'inset(100% 0 0 0)' }}
                  animate={
                    titleInView
                      ? reduceMotion
                        ? { opacity: 1 }
                        : { clipPath: 'inset(0% 0 0 0)' }
                      : undefined
                  }
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.28 }}
                >
                  <span className="rv-title-accent">{t('des expériences qui marquent.', 'experiences that resonate.')}</span>
                </motion.span>
              </span>
            </h2>
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
            variants={{
              hidden: { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.985 },
              show: {
                opacity: 1,
                scale: 1,
                transition: { duration: reduceMotion ? 0.3 : 1.0, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            className="rv-carousel"
            role="region"
            aria-roledescription="carrousel"
            aria-label={t('Réalisations récentes', 'Recent work')}
          >
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.slug}
                  className="rv-slide"
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={image!} alt="" className="rv-slide-img" />
                  <div className="rv-slide-scrim" aria-hidden="true" />

                  {current.offeringName && (
                    <span className="rv-slide-offer-badge">{current.offeringName}</span>
                  )}

                  <span className="rv-slide-live-badge">
                    <span className="rv-dot" />
                    Live
                  </span>

                  <div className="rv-slide-content">
                    <h3>{current.name}</h3>
                    <p className="rv-slide-desc">{description}</p>

                    {current.details && current.details.length > 0 && (
                      <div className="rv-details">
                        {current.details.map((d) => (
                          <div key={d.id} className="rv-detail">
                            <span className="rv-detail-label">{d.label}</span>
                            <span className="rv-detail-value">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link href={`/embed/${current.slug}`} className="rv-slide-cta">
                      {t("Voir l'expérience", 'View experience')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="rv-arrow rv-arrow-prev"
                  aria-label={t('Projet précédent', 'Previous project')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={next}
                  className="rv-arrow rv-arrow-next"
                  aria-label={t('Projet suivant', 'Next project')}
                >
                  <ChevronRight size={20} />
                </button>

                <div className="rv-dots">
                  {projects.map((p, i) => (
                    <button
                      key={p.slug}
                      onClick={() => goTo(i)}
                      className="rv-dot-nav"
                      data-active={i === index}
                      aria-label={t(`Aller au projet ${i + 1}`, `Go to project ${i + 1}`)}
                      aria-current={i === index}
                    />
                  ))}
                </div>
              </>
            )}
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

        .rv-title-line {
          display: block;
          overflow: hidden;
        }

        .rv-title-line-inner {
          display: block;
        }

        .rv-title-accent {
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

        .rv-carousel {
          position: relative;
          min-height: 640px;
          border-radius: 24px;
          overflow: hidden;
          background-color: ${colors.charcoal};
        }

        .rv-slide {
          position: absolute;
          inset: 0;
        }

        .rv-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .rv-slide-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.4) 42%, rgba(11,11,11,0.05) 68%);
        }

        .rv-slide-offer-badge {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 2;
          border-radius: 999px;
          background-color: rgba(200,164,93,0.92);
          padding: 6px 14px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #FFFFFF;
        }

        .rv-slide-live-badge {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background-color: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 6px 14px;
          font-size: 11px;
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

        .rv-slide-content {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          max-width: 640px;
          padding: 48px 100px 48px 48px;
        }

        .rv-slide-content h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.9rem, 3.4vw, 3rem);
          font-weight: 500;
          color: #FFFFFF;
          margin: 0 0 10px;
        }

        .rv-slide-desc {
          font-size: 14.5px;
          line-height: 1.65;
          color: rgba(255,255,255,0.72);
          margin: 0 0 18px;
        }

        .rv-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }

        .rv-detail {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          border-radius: 10px;
          background-color: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .rv-detail-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
        }

        .rv-detail-value {
          font-size: 14px;
          font-weight: 700;
          color: ${colors.gold};
          line-height: 1.3;
        }

        .rv-slide-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${colors.gold};
          color: #FFFFFF;
          padding: 13px 26px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .rv-slide-cta:hover {
          background: #FFFFFF;
          color: ${colors.ink};
        }

        .rv-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .rv-arrow:hover,
        .rv-arrow:focus-visible {
          background: ${colors.gold};
          border-color: ${colors.gold};
          color: #000000;
        }

        .rv-arrow-prev { left: 24px; }
        .rv-arrow-next { right: 24px; }

        .rv-dots {
          position: absolute;
          bottom: 28px;
          right: 32px;
          z-index: 3;
          display: flex;
          gap: 8px;
        }

        .rv-dot-nav {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rv-dot-nav[data-active="true"] {
          width: 22px;
          border-radius: 4px;
          background: ${colors.gold};
        }

        .rv-dot-nav:focus-visible {
          outline: 2px solid ${colors.gold};
          outline-offset: 2px;
        }

        @media (max-width: 760px) {
          .rv-wrap {
            padding: 110px 24px !important;
          }
          .rv-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .rv-carousel {
            min-height: 480px;
          }
          .rv-slide-content {
            padding: 32px 24px;
            max-width: 100%;
          }
          .rv-arrow {
            width: 38px;
            height: 38px;
          }
          .rv-dots {
            right: 24px;
            bottom: 20px;
          }
        }
      `}</style>
    </section>
  );
}
