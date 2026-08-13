'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Aperture, Layers, Sparkles, QrCode, MapPin, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

const BORDER = '#E2D8C8';

/* Largeur (en fraction de la progression 0-1) de la fenêtre de transition de couleur
   autour du seuil d'activation d'un marqueur — très courte et subtile, comme validé. */
const MARKER_TRANSITION_WINDOW = 0.025;

type Step = {
  icon: LucideIcon;
  num: string;
  title: string;
  desc: string;
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* Marqueur individuel — sa couleur d'activation est dérivée de la MÊME valeur de
   progression que la ligne (scrollYProgress), donc toujours parfaitement synchronisée
   avec elle. Le seuil est mesuré (pas deviné) : voir la mesure de géométrie plus bas. */
function TimelineMarker({
  step,
  threshold,
  scrollYProgress,
  reduceMotion,
  markerRef,
}: {
  step: Step;
  threshold: number;
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
  markerRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = step.icon;
  const range: [number, number] = [
    Math.max(0, threshold - MARKER_TRANSITION_WINDOW),
    Math.min(1, threshold + MARKER_TRANSITION_WINDOW),
  ];

  const bg = useTransform(scrollYProgress, range, [colors.white, colors.gold]);
  const border = useTransform(scrollYProgress, range, ['rgba(200,164,93,0.6)', colors.gold]);
  const iconColor = useTransform(scrollYProgress, range, [colors.gold, '#FFFFFF']);

  return (
    <motion.div variants={item} className="ccm-step">
      <motion.div
        ref={markerRef}
        className="ccm-marker"
        style={
          reduceMotion
            ? { backgroundColor: colors.gold, borderColor: colors.gold, color: '#FFFFFF' }
            : { backgroundColor: bg, borderColor: border, color: iconColor }
        }
      >
        <Icon size={18} strokeWidth={1.6} />
      </motion.div>

      <p className="ccm-num">{step.num}</p>

      <h3>{step.title}</h3>

      <p className="ccm-desc">{step.desc}</p>
    </motion.div>
  );
}

export default function CommentCaMarche() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const steps: Step[] = [
    {
      icon: Aperture,
      num: '01',
      title: t('Captation immersive', 'Immersive capture'),
      desc: t(
        'Nous capturons votre espace en 3D ou 360°, pour une visite réaliste et fluide.',
        'We capture your space in 3D or 360°, for a realistic and fluid tour.'
      ),
    },
    {
      icon: Layers,
      num: '02',
      title: t('Intégration des contenus', 'Content integration'),
      desc: t(
        'Vos documents, menus, fiches et offres prennent place dans l’expérience.',
        'Your documents, menus, listings and offers are integrated into the experience.'
      ),
    },
    {
      icon: Sparkles,
      num: '03',
      title: t('Luxedia IA', 'Luxedia AI'),
      desc: t(
        'Luxedia guide chaque visiteur, répond aux questions et oriente vers l’action.',
        'Luxedia guides every visitor, answers questions and leads them to action.'
      ),
    },
    {
      icon: QrCode,
      num: '04',
      title: t('Livraison en ligne', 'Online delivery'),
      desc: t(
        'Un lien unique, un QR code, et une diffusion partout où vos clients vous cherchent.',
        'A unique link, a QR code, and distribution everywhere your clients look for you.'
      ),
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
  };

  /* ── Timeline scroll-liée ──
     La ligne (scaleX desktop / scaleY mobile) suit scrollYProgress sans transition ni
     easing : c'est une simple lecture directe de la position de scroll. Les seuils des
     marqueurs sont MESURÉS sur le vrai DOM (position du centre de chaque marqueur / taille
     totale de la timeline), recalculés au montage et au redimensionnement — jamais des
     fractions devinées. */
  const timelineRef = useRef<HTMLDivElement>(null);
  const markerAnchorRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [thresholds, setThresholds] = useState<number[]>([0.02, 0.28, 0.54, 0.79]);

  useLayoutEffect(() => {
    const measure = () => {
      const timeline = timelineRef.current;
      if (!timeline) return;

      const isMobile = window.matchMedia('(max-width: 760px)').matches;
      const timelineRect = timeline.getBoundingClientRect();
      const total = isMobile ? timelineRect.height : timelineRect.width;
      if (!total) return;

      const next = markerAnchorRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        const center = isMobile
          ? r.top + r.height / 2 - timelineRect.top
          : r.left + r.width / 2 - timelineRect.left;
        return Math.min(1, Math.max(0, center / total));
      });

      setThresholds(next);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start end', 'end start'] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="comment-ca-marche"
      aria-label={t('Comment ça marche', 'How it works')}
      style={{
        backgroundColor: colors.cream,
        color: colors.ink,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: '80px',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '160px 32px',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
          style={{
            textAlign: 'center',
            marginBottom: '76px',
          }}
        >
          <motion.p variants={item} className="ccm-label">
            {t('Comment ça marche', 'How it works')}
          </motion.p>

          <motion.h2 variants={item} className="ccm-title">
            {t('Un processus simple,', 'A simple process,')}
            <br />
            <span>{t('des résultats puissants.', 'powerful results.')}</span>
          </motion.h2>
        </motion.div>

        <motion.div
          ref={timelineRef}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
          className="ccm-timeline"
        >
          <motion.div
            className="ccm-axis"
            aria-hidden="true"
            style={
              reduceMotion
                ? { opacity: 1, scaleX: 1, scaleY: 1 }
                : { opacity: 1, scaleX, scaleY }
            }
          />

          {steps.map((s, i) => (
            <TimelineMarker
              key={s.num}
              step={s}
              threshold={thresholds[i] ?? 0}
              scrollYProgress={scrollYProgress}
              reduceMotion={!!reduceMotion}
              markerRef={(el) => {
                markerAnchorRefs.current[i] = el;
              }}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.25 }}
          className="ccm-note"
        >
          {t(
            'Un accompagnement complet, de la première discussion à la mise en ligne.',
            'Full support, from the first conversation to launch.'
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="ccm-streetview"
        >
          <MapPin size={15} strokeWidth={1.8} />
          {t(
            'Publication native sur Google Street View, directement depuis Matterport.',
            'Native publishing to Google Street View, directly from Matterport.'
          )}
        </motion.div>
      </div>

      {/* ── Fil doré en écho — reprend la continuité amorcée en bas de Luxedia.
           Indépendant : aucun état ni composant partagé avec Luxedia.tsx, l'alignement
           (left:50%) est garanti par la géométrie des deux sections pleine largeur.
           Fondu d'opacité pur, sans variation de longueur, pour rester discret. ── */}
      <motion.div
        aria-hidden="true"
        className="ccm-thread"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          x: '-50%',
          width: '1px',
          height: '56px',
          background: `linear-gradient(to bottom, ${colors.gold}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        .ccm-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${colors.gold};
          margin-bottom: 20px;
        }

        .ccm-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.3rem, 4vw, 4.2rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ccm-title span {
          color: ${colors.gold};
          font-style: italic;
        }

        .ccm-timeline {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 32px;
        }

        .ccm-axis {
          position: absolute;
          top: 22px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, rgba(200,164,93,0.7), rgba(200,164,93,0.3));
          transform-origin: left top;
        }

        .ccm-step {
          position: relative;
          flex: 1;
          text-align: left;
          padding-top: 60px;
        }

        .ccm-marker {
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${colors.white};
          border: 1px solid rgba(200,164,93,0.6);
          color: ${colors.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(200,164,93,0.14);
          z-index: 1;
        }

        .ccm-num {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 26px;
          line-height: 1;
          color: ${colors.gold};
          margin: 0 0 8px;
        }

        .ccm-step h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.2rem, 1.8vw, 1.5rem);
          font-weight: 400;
          color: ${colors.ink};
          line-height: 1.25;
          margin: 0 0 10px;
        }

        .ccm-desc {
          font-size: 13.5px;
          line-height: 1.7;
          color: ${colors.muted};
          margin: 0;
          max-width: 240px;
        }

        .ccm-note {
          text-align: center;
          color: ${colors.muted};
          font-size: 15px;
          line-height: 1.8;
          margin: 54px auto 0;
          max-width: 560px;
        }

        .ccm-streetview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: fit-content;
          margin: 22px auto 0;
          padding: 9px 18px;
          border-radius: 999px;
          background: rgba(200,164,93,0.08);
          border: 1px solid rgba(200,164,93,0.28);
          color: ${colors.ink};
          font-size: 13px;
          font-weight: 500;
        }

        .ccm-streetview svg {
          color: ${colors.gold};
          flex-shrink: 0;
        }

        @media (max-width: 760px) {
          .ccm-timeline {
            flex-direction: column;
            gap: 36px;
          }

          .ccm-axis {
            top: 0;
            bottom: 0;
            left: 22px;
            right: auto;
            width: 1px;
            height: auto;
            background: linear-gradient(to bottom, rgba(200,164,93,0.7), rgba(200,164,93,0.3));
          }

          .ccm-step {
            padding-top: 0;
            padding-left: 60px;
            min-height: 44px;
          }

          .ccm-thread {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}