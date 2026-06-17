'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Aperture, Layers, Sparkles, QrCode } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Comment ça marche — Acte 6 du film.
 *
 * Section explicative (pas émotionnelle) : on montre le parcours concret en
 * 4 étapes ordonnées. Les numéros 01–04 sont justifiés : c'est une vraie
 * séquence où l'ordre porte de l'information.
 *
 * Direction : fond charbon (continuité), 4 colonnes reliées par une ligne
 * dorée fine qui se "trace" au scroll, icônes fines, apparition séquencée.
 * Étape 1 = « 3D ou 360° » (pas « Matterport » : on nomme le bénéfice, pas l'outil).
 */

const GOLD = '#D4881E';
const CHARBON = '#0B0B0B';

export default function CommentCaMarche() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  const steps = [
    {
      icon: Aperture,
      num: '01',
      title: t('Captation immersive', 'Immersive capture'),
      desc: t(
        'Nous capturons votre espace en 3D ou 360°, pour une visite réaliste et fluide, accessible depuis n’importe quel appareil.',
        'We capture your space in 3D or 360°, for a realistic, fluid tour accessible from any device.'
      ),
    },
    {
      icon: Layers,
      num: '02',
      title: t('Intégration de vos contenus', 'Your content, integrated'),
      desc: t(
        'Fiches, menus, documents et offres prennent vie directement à l’intérieur de la visite immersive.',
        'Listings, menus, documents and offers come to life directly inside the immersive tour.'
      ),
    },
    {
      icon: Sparkles,
      num: '03',
      title: t('Intelligence Luxedia', 'Luxedia intelligence'),
      desc: t(
        'Luxedia apprend votre univers pour guider chaque visiteur — informer, orienter, accompagner, à toute heure.',
        'Luxedia learns your world to guide every visitor — inform, orient, accompany, around the clock.'
      ),
    },
    {
      icon: QrCode,
      num: '04',
      title: t('Expérience livrée', 'Experience delivered'),
      desc: t(
        'Un lien unique et un QR code prêts à partager. Aucune installation — votre expérience est en ligne en quelques jours.',
        'A unique link and a QR code ready to share. No installation — your experience is live within days.'
      ),
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={ref}
      aria-label={t('Comment ça marche', 'How it works')}
      style={{ backgroundColor: CHARBON, position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '150px 32px',
        }}
      >
        {/* En-tête */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={container}
          style={{ textAlign: 'center', marginBottom: '90px' }}
        >
          <motion.p
            variants={item}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(212,136,30,0.85)',
              marginBottom: '24px',
            }}
          >
            {t('Comment ça marche', 'How it works')}
          </motion.p>
          <motion.h2
            variants={item}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              color: '#F7F5F2',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {t('De votre espace à l’expérience.', 'From your space to the experience.')}
          </motion.h2>
        </motion.div>

        {/* Les 4 étapes */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
          className="ccm-steps"
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
          }}
        >
          {/* Ligne connectrice dorée qui se trace au scroll (desktop) */}
          <motion.div
            aria-hidden="true"
            className="ccm-line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '34px',
              left: '12%',
              right: '12%',
              height: '1px',
              background:
                'linear-gradient(to right, rgba(212,136,30,0) 0%, rgba(212,136,30,0.5) 15%, rgba(212,136,30,0.5) 85%, rgba(212,136,30,0) 100%)',
              transformOrigin: 'left',
            }}
          />

          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                variants={item}
                className="ccm-step"
                style={{ position: 'relative', textAlign: 'center' }}
              >
                {/* Pastille icône */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '68px',
                    height: '68px',
                    margin: '0 auto 28px',
                    borderRadius: '50%',
                    backgroundColor: CHARBON,
                    border: '1px solid rgba(212,136,30,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(212,136,30,0.12)',
                  }}
                >
                  <Icon size={26} strokeWidth={1.3} style={{ color: GOLD }} />
                </div>

                {/* Numéro */}
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '15px',
                    letterSpacing: '0.3em',
                    color: 'rgba(212,136,30,0.7)',
                    margin: '0 0 12px',
                  }}
                >
                  {s.num}
                </p>

                {/* Titre */}
                <h3
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontWeight: 400,
                    fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
                    color: '#F7F5F2',
                    lineHeight: 1.25,
                    margin: '0 0 14px',
                  }}
                >
                  {s.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'rgba(247,245,242,0.6)',
                    margin: '0 auto',
                    maxWidth: '240px',
                  }}
                >
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .ccm-steps {
            grid-template-columns: 1fr 1fr !important;
            gap: 48px 24px !important;
          }
          .ccm-line { display: none !important; }
        }
        @media (max-width: 520px) {
          .ccm-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
