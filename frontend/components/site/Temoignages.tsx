'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { testimonialsApi, type TestimonialDto } from '@/lib/api';
import { colors } from '@/config/theme';

const AUTOPLAY_MS = 7000;

export default function Temoignages() {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    testimonialsApi
      .getPublished()
      .then((res) => {
        if (active && Array.isArray(res)) setTestimonials(res);
      })
      .catch(() => { /* silencieux — pas de repli fictif */ })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const count = testimonials.length;

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay — jamais démarré si l'utilisateur préfère peu de mouvement,
  // en pause complète au survol ou au focus clavier, jamais avec un seul témoignage.
  useEffect(() => {
    if (reduceMotion || paused || count <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduceMotion, paused, count]);

  // Section honnête : rien à afficher tant qu'aucun témoignage n'est publié.
  if (!loading && count === 0) return null;

  const current = testimonials[index];

  return (
    <section
      id="temoignages"
      aria-label={t('Témoignages', 'Testimonials')}
      style={{
        backgroundColor: colors.cream,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '150px 32px' }} className="tm-wrap">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="tm-label"
        >
          {t('Témoignages', 'Testimonials')}
        </motion.p>

        <div
          ref={containerRef}
          role="region"
          aria-roledescription="carrousel"
          aria-label={t('Témoignages clients', 'Client testimonials')}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="tm-carousel"
        >
          <div className="tm-slide" aria-live="polite">
            {loading || !current ? (
              <p style={{ color: colors.muted, fontSize: '15px' }}>{t('Chargement…', 'Loading…')}</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="tm-avatar">
                    {current.photoUrl ? (
                      <img src={current.photoUrl} alt={current.name} className="tm-avatar-img" />
                    ) : (
                      <span className="tm-avatar-fallback">{current.name.charAt(0)}</span>
                    )}
                  </div>

                  <p className="tm-quote">“{current.quote}”</p>

                  <p className="tm-name">{current.name}</p>
                  {current.company && <p className="tm-company">{current.company}</p>}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {!loading && count > 1 && (
            <>
              <button
                onClick={prev}
                className="tm-arrow tm-arrow-prev"
                aria-label={t('Témoignage précédent', 'Previous testimonial')}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="tm-arrow tm-arrow-next"
                aria-label={t('Témoignage suivant', 'Next testimonial')}
              >
                <ChevronRight size={18} />
              </button>

              <div className="tm-dots">
                {testimonials.map((tst, i) => (
                  <button
                    key={tst.id}
                    onClick={() => goTo(i)}
                    className="tm-dot"
                    data-active={i === index}
                    aria-label={t(`Aller au témoignage ${i + 1}`, `Go to testimonial ${i + 1}`)}
                    aria-current={i === index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .tm-label {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 48px;
        }

        .tm-carousel {
          position: relative;
          text-align: center;
        }

        .tm-slide {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tm-avatar {
          width: 68px;
          height: 68px;
          margin: 0 auto 26px;
          border-radius: 50%;
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid rgba(200,164,93,0.4);
          box-shadow: 0 14px 34px rgba(200,164,93,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tm-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tm-avatar-fallback {
          font-family: var(--font-cormorant), serif;
          font-size: 26px;
          color: ${colors.gold};
        }

        .tm-quote {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: clamp(1.3rem, 2.4vw, 1.8rem);
          line-height: 1.5;
          color: ${colors.ink};
          max-width: 640px;
          margin: 0 auto 26px;
        }

        .tm-name {
          font-size: 14px;
          font-weight: 700;
          color: ${colors.ink};
          margin: 0;
        }

        .tm-company {
          font-size: 13px;
          color: ${colors.muted};
          margin: 4px 0 0;
        }

        .tm-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(200,164,93,0.4);
          background: #FFFFFF;
          color: ${colors.ink};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .tm-arrow:hover,
        .tm-arrow:focus-visible {
          background-color: ${colors.gold};
          border-color: ${colors.gold};
          color: #FFFFFF;
        }

        .tm-arrow-prev {
          left: -8px;
        }

        .tm-arrow-next {
          right: -8px;
        }

        .tm-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
        }

        .tm-dot {
          width: 14px;
          height: 2px;
          border-radius: 2px;
          border: none;
          padding: 0;
          background-color: rgba(16,16,16,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tm-dot[data-active="true"] {
          width: 28px;
          background-color: ${colors.gold};
        }

        .tm-dot:focus-visible {
          outline: 2px solid ${colors.gold};
          outline-offset: 3px;
        }

        @media (max-width: 640px) {
          .tm-wrap {
            padding: 110px 24px !important;
          }
          .tm-arrow {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
