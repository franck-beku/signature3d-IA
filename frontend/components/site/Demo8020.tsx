'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

function useCountUp(target: number, inView: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return count;
}

const GOLD = '#C8A45D';
const WHITE = '#FCFBF8';
const INK = '#101010';
const MUTED = '#6B6458';
const BORDER = '#E7DED0';

export default function Demo8020() {
  const { t } = useLanguage();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const count80 = useCountUp(80, statsInView);
  const count20 = useCountUp(20, statsInView, 1100);

  const fade = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label={t('L’expérience 80/20', 'The 80/20 experience')}
      style={{
        backgroundColor: WHITE,
        color: INK,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
        }}
        className="demo8020-wrap"
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fade}
          className="demo8020-grid"
        >
          <div>
            <p className="demo8020-label">
              {t('Notre approche', 'Our approach')}
            </p>

            <h2 className="demo8020-title">
              {t("L’immersion au service", 'Immersion serving')}
              <br />
              {t('de vos objectifs.', 'your objectives.')}
            </h2>

            <p className="demo8020-text">
              {t(
                "Notre méthode 80/20 combine technologie et intelligence conversationnelle pour créer des expériences qui génèrent des résultats concrets avec un minimum d’effort.",
                'Our 80/20 method combines technology and conversational intelligence to create experiences that generate concrete results with minimal effort.'
              )}
            </p>

            <Link href="/comment-ca-marche" className="demo8020-cta">
              {t('Découvrir comment ça marche', 'See how it works')}
              <span>→</span>
            </Link>
          </div>

          <div className="demo8020-center" ref={statsRef}>
            <div className="demo8020-stat left">
              <strong>{count80}%</strong>
              <span>{t('De l’impact', 'Impact')}</span>
              <p>
                {t(
                  "L’essentiel mis en valeur pour capter l’attention.",
                  'The essential elements showcased to capture attention.'
                )}
              </p>
            </div>

            <div className="demo8020-circle">
              <span>80/20</span>
            </div>

            <div className="demo8020-stat right">
              <strong>{count20}%</strong>
              <span>{t("De l’effort", 'Effort')}</span>
              <p>
                {t(
                  'Une mise en place simple, rapide et efficace.',
                  'A simple, fast and efficient setup.'
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fade}
          className="demo8020-benefits"
        >
          <div>
            <h3>{t("Capturer l’attention", 'Capture attention')}</h3>
            <p>
              {t(
                'Une immersion visuelle qui marque les esprits dès les premières secondes.',
                'A visual immersion that leaves an impression in the first seconds.'
              )}
            </p>
          </div>

          <div>
            <h3>{t('Informer intelligemment', 'Inform intelligently')}</h3>
            <p>
              {t(
                'Des informations claires et accessibles grâce à l’IA conversationnelle.',
                'Clear and accessible information through conversational AI.'
              )}
            </p>
          </div>

          <div>
            <h3>{t('Convertir plus', 'Convert more')}</h3>
            <p>
              {t(
                'Des visiteurs engagés qui passent à l’action plus facilement.',
                'Engaged visitors who take action more easily.'
              )}
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .demo8020-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.3fr;
          gap: 72px;
          align-items: center;
        }

        .demo8020-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 20px;
        }

        .demo8020-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: ${INK};
          margin: 0 0 24px;
        }

        .demo8020-text {
          max-width: 420px;
          font-size: 16px;
          line-height: 1.8;
          color: ${MUTED};
          margin: 0 0 32px;
        }

        .demo8020-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${INK};
          color: #fff;
          padding: 15px 26px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .demo8020-cta:hover {
          background: ${GOLD};
          color: ${INK};
          transform: translateY(-2px);
        }

        .demo8020-center {
          position: relative;
          min-height: 360px;
          display: grid;
          grid-template-columns: 1fr 220px 1fr;
          align-items: center;
          gap: 34px;
        }

        .demo8020-circle {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          border: 1px solid #E7DED0;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle, rgba(200,164,93,0.06), transparent 65%);
          box-shadow: 0 24px 80px rgba(0,0,0,0.06);
        }

        .demo8020-circle span {
          font-family: var(--font-cormorant), serif;
          font-size: 3rem;
          color: ${GOLD};
        }

        .demo8020-stat {
          text-align: center;
        }

        .demo8020-stat strong {
          display: block;
          font-family: var(--font-cormorant), serif;
          font-size: 3rem;
          font-weight: 400;
          color: ${GOLD};
          margin-bottom: 10px;
        }

        .demo8020-stat span {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 12px;
        }

        .demo8020-stat p {
          font-size: 14px;
          line-height: 1.65;
          color: ${MUTED};
          margin: 0 auto;
          max-width: 190px;
        }

        .demo8020-stat.right strong {
          font-size: 2.4rem;
          color: ${MUTED};
        }

        .demo8020-stat.right span {
          color: ${MUTED};
        }

        .demo8020-benefits {
          margin-top: 90px;
          padding-top: 46px;
          border-top: 1px solid ${BORDER};
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
        }

        .demo8020-benefits h3 {
          font-family: var(--font-cormorant), serif;
          font-size: 1.55rem;
          font-weight: 400;
          margin: 0 0 12px;
          color: ${INK};
        }

        .demo8020-benefits p {
          font-size: 14px;
          line-height: 1.75;
          color: ${MUTED};
          margin: 0;
        }

        @media (max-width: 980px) {
          .demo8020-grid {
            grid-template-columns: 1fr;
            gap: 56px;
          }

          .demo8020-center {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .demo8020-circle {
            margin: 0 auto;
          }

          .demo8020-benefits {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </section>
  );
}