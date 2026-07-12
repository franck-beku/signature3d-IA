'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { projectsApi } from '@/lib/api';

const GOLD = '#C8A45D';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=85&auto=format&fit=crop';

function getMatterportThumb(matterportId?: string): string | null {
  if (!matterportId) return null;
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb?width=1600&dpr=1&disable=upscale`;
}

export default function ContactFinal() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [bgImage, setBgImage] = useState<string | null>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const linesInView = useInView(linesRef, { once: true, margin: '-80px' });

  useEffect(() => {
    let active = true;
    projectsApi
      .getFeatured()
      .then((projects) => {
        if (active && Array.isArray(projects) && projects.length > 0) {
          const p = projects[0];
          setBgImage(p.coverImage || getMatterportThumb(p.matterportId) || null);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const lines = [
    { fr: 'Aujourd’hui, vous découvrez nos réalisations.', en: 'Today, you’re discovering our work.' },
    { fr: 'Demain, ce pourrait être la vôtre.', en: 'Tomorrow, it could be yours.' },
    { fr: 'À votre tour d’écrire la vôtre.', en: 'Your turn to write yours.' },
  ];

  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
          viewport: { once: true, margin: '-80px' },
        };

  return (
    <section id="contact-final" className="final-section">
      <img
        src={bgImage ?? FALLBACK_IMAGE}
        alt=""
        aria-hidden="true"
        className="final-bg-img"
      />
      <div className="final-scrim" aria-hidden="true" />

      <div className="final-inner">
        <div ref={linesRef} className="final-lines">
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
              <motion.span
                style={{ display: 'block' }}
                initial={reduce ? { opacity: 1 } : { clipPath: 'inset(100% 0 0 0)' }}
                animate={
                  linesInView
                    ? reduce
                      ? { opacity: 1 }
                      : { clipPath: 'inset(0% 0 0 0)' }
                    : undefined
                }
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.1 + i * 0.18 }}
              >
                {i === lines.length - 1 ? (
                  <span className="final-line-accent">{t(line.fr, line.en)}</span>
                ) : (
                  t(line.fr, line.en)
                )}
              </motion.span>
            </span>
          ))}
        </div>

        <motion.p {...fade(0.65)} className="final-lead-copy">
          {t(
            'Transformons ensemble votre espace en une expérience immersive qui marquera durablement vos visiteurs.',
            "Let's transform your space together into an immersive experience that leaves a lasting impression on your visitors."
          )}
        </motion.p>

        <motion.div {...fade(0.8)}>
          <Link href="/contact" className="final-cta">
            {t('Réservez votre démonstration', 'Book your demonstration')}
            <span>→</span>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .final-section {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .final-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.9) contrast(1.1) brightness(0.75);
        }

        .final-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0.65) 60%, rgba(11,11,11,0.85) 100%);
        }

        .final-inner {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 0 auto;
          padding: 140px 32px;
          text-align: center;
        }

        .final-lines {
          font-family: var(--font-cormorant), serif;
          font-weight: 400;
          font-size: clamp(2rem, 4.2vw, 3.6rem);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #F7F5F2;
          margin-bottom: 36px;
        }

        .final-line-accent {
          color: ${GOLD};
          font-style: italic;
        }

        .final-lead-copy {
          font-size: 17px;
          line-height: 1.8;
          color: rgba(247,245,242,0.78);
          max-width: 560px;
          margin: 0 auto 40px;
        }

        .final-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: ${GOLD};
          color: #FFFFFF;
          border-radius: 7px;
          padding: 19px 40px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 18px 46px -18px rgba(200,164,93,0.65);
        }

        .final-cta:hover {
          background: #FFFFFF;
          color: #101010;
          transform: translateY(-3px);
        }

        @media (max-width: 640px) {
          .final-inner {
            padding: 100px 24px;
          }
        }
      `}</style>
    </section>
  );
}
