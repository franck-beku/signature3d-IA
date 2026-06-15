'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Section « Nos univers » — Acte 3 du film.
 *
 * Hiérarchie : l'IMAGE domine, le texte accompagne (site immersif).
 *  - titre raisonnable (text-5xl → 8xl) qui n'écrase pas la photo
 *  - alternance gauche / droite
 *  - numéro géant en filigrane (retrouve son rôle quand le titre respire)
 *  - parallaxe ±15%
 *  - animation séquencée titre → accroche → bouton
 *  - CTA « verre dépoli » façon Apple, lisible sur toute image, accent doré au survol
 *  - texte centré verticalement (tient toujours dans l'écran)
 *
 * On NE touche pas : les images ni les accroches.
 */

type Univers = {
  slug: string;
  image: string;
  titre: string;
  accroche: { fr: string; en: string };
};

const UNIVERS: Univers[] = [
  {
    slug: 'automobile',
    image: '/assets/univers/auto.jpg',
    titre: 'Automobile',
    accroche: {
      fr: 'Présentez chaque véhicule comme s’il était devant votre client.',
      en: 'Present every vehicle as if it stood before your client.',
    },
  },
  {
    slug: 'immobilier',
    image: '/assets/univers/immobilier.jpg',
    titre: 'Immobilier',
    accroche: {
      fr: 'Faites visiter sans déplacement.',
      en: 'Let them walk through — without leaving home.',
    },
  },
  {
    slug: 'restaurant',
    image: '/assets/univers/resto.jpg',
    titre: 'Restauration',
    accroche: {
      fr: 'Donnez envie avant même la réservation.',
      en: 'Spark desire before the reservation.',
    },
  },
  {
    slug: 'hotellerie',
    image: '/assets/univers/hotel.jpg',
    titre: 'Hôtellerie',
    accroche: {
      fr: 'Créez l’expérience avant l’arrivée.',
      en: 'Begin the experience before arrival.',
    },
  },
  {
    slug: 'commerce',
    image: '/assets/univers/commerce.jpg',
    titre: 'Commerce',
    accroche: {
      fr: 'Transformez une visite en découverte.',
      en: 'Turn a visit into a discovery.',
    },
  },
];

export default function NosUnivers() {
  const { t } = useLanguage();

  return (
    <section
      aria-label={t('Nos univers', 'Our worlds')}
      style={{ backgroundColor: '#0B0B0B' }}
      className="w-full"
    >
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16 text-center md:pt-36 md:pb-24">
        <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#D4881E]">
          {t('Nos univers', 'Our worlds')}
        </p>
        <h2
          className="text-3xl font-light leading-tight text-[#F7F5F2] md:text-5xl"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          {t('Cinq mondes. Une même signature.', 'Five worlds. One signature.')}
        </h2>
      </div>

      {UNIVERS.map((u, i) => (
        <UniversPanel key={u.slug} univers={u} index={i} t={t} />
      ))}
    </section>
  );
}

function UniversPanel({
  univers,
  index,
  t,
}: {
  univers: Univers;
  index: number;
  t: (fr: string, en: string) => string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  const numero = String(index + 1).padStart(2, '0');
  const alignRight = index % 2 === 1;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div
      ref={panelRef}
      style={{ position: 'relative', height: '90vh', overflow: 'hidden' }}
      className="flex w-full items-center"
    >
      {/* Image de fond + parallaxe — z-index 0 */}
      <motion.div
        style={{
          y,
          position: 'absolute',
          left: 0,
          right: 0,
          top: '-12%',
          height: '124%',
          zIndex: 0,
          backgroundImage: `url("${univers.image}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Overlay dégradé — z-index 1 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: alignRight
            ? 'linear-gradient(to top, rgba(11,11,11,0.72) 0%, rgba(11,11,11,0.28) 50%, rgba(11,11,11,0.08) 100%), linear-gradient(to left, rgba(11,11,11,0.50) 0%, rgba(11,11,11,0) 58%)'
            : 'linear-gradient(to top, rgba(11,11,11,0.72) 0%, rgba(11,11,11,0.28) 50%, rgba(11,11,11,0.08) 100%), linear-gradient(to right, rgba(11,11,11,0.50) 0%, rgba(11,11,11,0) 58%)',
        }}
      />

      {/* Contenu — z-index 2.
          Padding latéral généreux pour que le titre ne touche jamais le bord. */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        style={{ position: 'relative', zIndex: 2 }}
        className="w-full px-10 md:px-20 lg:px-36"
      >
        <div
          className={`mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center ${
            alignRight ? 'items-end text-right' : 'items-start text-left'
          }`}
        >
          {/* Titre + numéro géant en filigrane */}
          <motion.div variants={item} className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute select-none font-light leading-none"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 'clamp(7rem, 16vw, 16rem)',
                top: '50%',
                transform: 'translateY(-50%)',
                [alignRight ? 'right' : 'left']: '-0.12em',
                color: 'rgba(212, 136, 30, 0.12)',
                zIndex: 0,
              }}
            >
              {numero}
            </span>

            <h3
              className="relative text-5xl font-light leading-none tracking-wide text-[#F7F5F2] md:text-7xl lg:text-8xl"
              style={{ fontFamily: 'var(--font-cormorant), serif', zIndex: 1 }}
            >
              {univers.titre}
            </h3>
          </motion.div>

          {/* Accroche */}
          <motion.p
            variants={item}
            className="mt-6 max-w-md text-base font-light leading-relaxed text-[#F7F5F2]/95 md:text-xl"
          >
            {t(univers.accroche.fr, univers.accroche.en)}
          </motion.p>

          {/* CTA verre dépoli façon Apple, accent doré au survol */}
          <motion.div variants={item} className="mt-9">
            <Link
              href={`/realisations/${univers.slug}`}
              className="group inline-flex items-center gap-3 rounded-sm px-7 py-3 text-sm uppercase tracking-[0.2em] text-[#F7F5F2] transition-all duration-300 hover:bg-[#D4881E] hover:text-[#0B0B0B]"
              style={{
                background: 'rgba(0,0,0,0.28)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(212,136,30,0.55)',
                boxShadow: '0 0 0 rgba(212,136,30,0)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(212,136,30,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 rgba(212,136,30,0)';
              }}
            >
              {t('Voir les réalisations', 'View projects')}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}