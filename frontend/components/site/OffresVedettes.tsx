'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { offeringsApi, type OfferingDto } from '@/lib/api';
import { colors } from '@/config/theme';

export default function OffresVedettes() {
  const { t, lang } = useLanguage();
  const [offerings, setOfferings] = useState<OfferingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    offeringsApi
      .getActive()
      .then((res) => {
        if (active && Array.isArray(res)) {
          setOfferings(res.filter((o) => o.isFeatured).slice(0, 3));
        }
      })
      .catch(() => { /* silencieux — pas de repli fictif */ })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Section honnête : rien à afficher tant qu'aucune offre n'est marquée "à la une".
  if (!loading && offerings.length === 0) return null;

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
      aria-label={t('Nos offres', 'Our offers')}
      style={{
        backgroundColor: colors.white,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '150px 32px' }} className="ov-wrap">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          className="ov-header"
        >
          <div>
            <motion.p variants={item} className="ov-label">
              {t('Nos offres', 'Our offers')}
            </motion.p>
            <motion.h2 variants={item} className="ov-title">
              {t('Des formules pensées', 'Solutions designed')}
              <br />
              <span>{t('pour chaque projet.', 'for every project.')}</span>
            </motion.h2>
          </div>

          <motion.div variants={item}>
            <Link href="/services" className="ov-all-link">
              {t('Découvrir toutes nos offres', 'Discover all our offers')}
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
            viewport={{ once: true, amount: 0.25 }}
            variants={container}
            className="ov-grid"
          >
            {offerings.map((o) => {
              const displayLevel = lang === 'en' ? o.levelEn || o.level : o.level;
              const displayDescription = lang === 'en' ? o.shortDescriptionEn || o.shortDescription : o.shortDescription;

              return (
                <motion.div key={o.id} variants={item} className="ov-card">
                  <div className="ov-icon">
                    <Sparkles size={25} strokeWidth={1.4} color={colors.gold} />
                  </div>

                  {displayLevel && <p className="ov-level">{displayLevel}</p>}

                  <h3>{o.name}</h3>

                  <div className="ov-line" />

                  {displayDescription && <p className="ov-desc">{displayDescription}</p>}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .ov-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 32px;
          margin-bottom: 58px;
        }

        .ov-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 18px;
        }

        .ov-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ov-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .ov-all-link {
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

        .ov-all-link:hover {
          background-color: ${colors.ink};
          color: #FFFFFF;
          border-color: ${colors.ink};
        }

        .ov-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .ov-card {
          position: relative;
          background-color: ${colors.cream};
          border: 1px solid ${colors.border};
          border-radius: 16px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.06);
          padding: 30px 26px;
          transition: all 0.3s ease;
        }

        .ov-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 34px 86px rgba(0,0,0,0.11);
          border-color: rgba(200,164,93,0.36);
        }

        .ov-card:hover .ov-line {
          width: 54px;
        }

        .ov-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          margin: 0 0 18px;
          background-color: #fff;
          box-shadow: 0 10px 28px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ov-level {
          margin: 0 0 10px;
          color: ${colors.gold};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .ov-card h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.7rem, 2vw, 2.2rem);
          font-weight: 500;
          color: ${colors.ink};
          margin: 0 0 14px;
        }

        .ov-line {
          width: 34px;
          height: 1px;
          background-color: ${colors.gold};
          margin: 0 0 20px;
          transition: width 0.35s ease;
        }

        .ov-desc {
          font-size: 15px;
          line-height: 1.75;
          color: ${colors.muted};
          font-weight: 300;
          margin: 0;
        }

        @media (max-width: 760px) {
          .ov-wrap {
            padding: 110px 24px !important;
          }
          .ov-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
