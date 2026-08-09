'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { colors } from '@/config/theme';

/**
 * Hero cinématique — Acte 1 du film.
 *
 * Direction : sombre, premium, silencieux.
 *  - 5 images d'univers en fondu enchaîné LENT (≈7,5 s par image)
 *  - léger zoom « Ken Burns » (scale 1 → 1.08) pendant l'affichage : ça « vit »
 *  - texte FIXE au-dessus, ne bouge pas pendant que les images défilent
 *  - voile sombre constant pour garantir la lisibilité quelle que soit l'image
 *  - deux CTA : « Découvrir l'expérience » (plein doré) + « Voir nos réalisations » (verre)
 *  - indicateur de scroll discret en bas
 *
 * Pas de carrousel agressif, pas de flèches, pas de points cliquables :
 * le mouvement est ambiant, pas interactif.
 */


/* Mêmes assets que la section Nos univers — cohérence du film. */
const SLIDES = [
  '/assets/univers/auto.jpg',
  '/assets/univers/immobilier.jpg',
  '/assets/univers/resto.jpg',
  '/assets/univers/hotellerie-nouveau.jpeg',
  '/assets/univers/commerce.jpg',
];

/* Durées (ms) — mouvement lent et élégant, rythme contemplatif. */
const HOLD = 6500; // temps d'affichage net d'une image
const FADE = 2500; // durée du fondu entre deux images
const CYCLE = HOLD + FADE;

/* Visite Matterport en fond — Mercedes CLE 53 AMG (meilleur point de vue d'ouverture, vérifié
   manuellement). ui=0/vr=0/help=0/brand=0 masquent les contrôles Matterport, inutiles en fond
   d'ambiance. */
const MATTERPORT_ID = 'WJzvgHF44zq';
const MATTERPORT_SLUG = 'mercedes-voiture-1';
const MATTERPORT_EMBED_URL = `https://my.matterport.com/show/?m=${MATTERPORT_ID}&play=1&qs=1&ui=0&vr=0&help=0&brand=0`;

/* Le diaporama photo reste affiché au moins ce délai avant le crossfade vers le Matterport, même
   si l'iframe charge plus vite — évite un flash trop brutal. */
const MATTERPORT_MIN_DISPLAY_DELAY = 800;

export default function Hero() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [matterportIframeLoaded, setMatterportIframeLoaded] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const matterportVisible = matterportIframeLoaded && minDelayElapsed;

  useEffect(() => {
    const id = setTimeout(() => setMinDelayElapsed(true), MATTERPORT_MIN_DISPLAY_DELAY);
    return () => clearTimeout(id);
  }, []);

  // Respecte la préférence système « animations réduites ».
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Avance le diaporama. Si l'utilisateur préfère peu de mouvement : on fige.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, CYCLE);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      aria-label={t('Accueil', 'Home')}
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '640px',
        overflow: 'hidden',
        backgroundColor: colors.charcoal,
      }}
    >
      {/* ── Diaporama d'images en fondu + Ken Burns ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ opacity: 0, filter: 'brightness(0.7)' }}
            animate={{ opacity: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, filter: 'brightness(0.7)' }}
            transition={{ duration: FADE / 1000, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: reduceMotion ? 1 : 1.08 }}
              transition={{ duration: CYCLE / 1000, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <Image
                src={SLIDES[index]}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Visite Matterport en fond — crossfade depuis le diaporama photo une fois chargée.
           Le diaporama continue de tourner derrière : filet de sécurité si l'iframe échoue. ── */}
      <div
        aria-hidden="true"
        className="hero-matterport"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: matterportVisible ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <iframe
          src={MATTERPORT_EMBED_URL}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="xr-spatial-tracking"
          title={t('Visite Mercedes CLE 53 AMG', 'Mercedes CLE 53 AMG tour')}
          tabIndex={-1}
          onLoad={() => setMatterportIframeLoaded(true)}
        />
      </div>

      {/* ── Voile sombre constant (lisibilité du texte) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0.35) 40%, rgba(11,11,11,0.75) 100%)',
        }}
      />
      {/* Vignettage latéral subtil pour concentrer le regard au centre. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, rgba(11,11,11,0) 35%, rgba(11,11,11,0.45) 100%)',
        }}
      />

      {/* ── Contenu fixe, calé à gauche (langage campagne premium) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="hero-content"
          style={{
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 clamp(24px, 7vw, 110px)',
            textAlign: 'left',
          }}
        >
          {/* Bloc texte élargi à 720px pour porter la phrase produit sur 3 niveaux */}
          <div style={{ maxWidth: '720px' }}>
          {/* Eyebrow — nom de marque */}
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(200,164,93,0.85)',
              marginBottom: '28px',
            }}
          >
            {t('SIGNATURE IMMERSION', 'SIGNATURE IMMERSION')}
          </p>

          {/* Titre */}
          <h1
            className="hero-h1"
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 200,
              color: '#F7F5F2',
              lineHeight: 1.12,
              letterSpacing: '0.01em',
              fontSize: 'clamp(2.2rem, 5.4vw, 4.6rem)',
              margin: 0,
              maxWidth: '13ch',
            }}
          >
            {t('Chaque espace possède une histoire.', 'Every space holds a story.')}
            <br />
            <span style={{ color: colors.gold, fontStyle: 'italic' }}>
              {t('Nous la rendons immersive.', 'We make it immersive.')}
            </span>
          </h1>

          {/* Phrase produit — remplace l'ancien sous-titre "3D · 360° · IA",
              traitement en rupture volontaire (casse normale, pas de espacement compact)
              pour rester lisible malgré sa longueur. */}
          <p
            style={{
              marginTop: '22px',
              fontSize: 'clamp(14.5px, 1.7vw, 17px)',
              fontWeight: 400,
              lineHeight: 1.65,
              letterSpacing: 'normal',
              textTransform: 'none',
              color: 'rgba(247,245,242,0.82)',
            }}
          >
            {t(
              "Visites immersives 3D et 360° enrichies par l'intelligence artificielle, pour les concessionnaires, l'immobilier, l'hôtellerie, les commerces et tous les espaces que vous souhaitez faire découvrir.",
              'Immersive 3D and 360° tours enhanced by artificial intelligence — for car dealerships, real estate, hospitality, retail, and every space you want to showcase.'
            )}
          </p>

          {/* Bande de mots-clés — discrète, ne doit pas concurrencer la phrase produit */}
          <p
            style={{
              marginTop: '20px',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(247,245,242,0.42)',
            }}
          >
            {t(
              'Immersion • Innovation • Intelligence artificielle • Expérience • Visibilité',
              'Immersion • Innovation • Artificial Intelligence • Experience • Visibility'
            )}
          </p>

          {/* CTA */}
          <div
            style={{
              marginTop: '44px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              pointerEvents: 'auto',
            }}
          >
            {/* Primaire — plein doré — l'action de conversion, la plus mise en avant */}
            <Link
              href="/contact"
              className="hero-cta-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: colors.gold,
                color: colors.charcoal,
                borderRadius: '10px',
                padding: '15px 30px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {t('Demander une démonstration', 'Request a demonstration')}
              <span aria-hidden="true">→</span>
            </Link>

            {/* Secondaire — verre */}
            <Link
              href="/realisations"
              className="hero-cta-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#F7F5F2',
                borderRadius: '10px',
                padding: '15px 30px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {t('Découvrir nos réalisations', 'Discover our work')}
            </Link>
          </div>
          </div>
        </motion.div>
      </div>

      {/* ── Indicateur de scroll discret ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(247,245,242,0.5)',
          }}
        >
          {t('Découvrir', 'Scroll')}
        </span>
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '32px',
            background:
              'linear-gradient(to bottom, rgba(200,164,93,0.8), rgba(200,164,93,0))',
          }}
        />
      </motion.div>

      {/* ── Bouton "Explorer" — mobile uniquement (interaction tactile du Matterport désactivée
           sur mobile pour ne pas bloquer le scroll de la page ; ce bouton ouvre la visite en
           plein sur sa propre page). Masqué par défaut, réaffiché par la media query ci-dessous. ── */}
      <Link
        href={`/embed/${MATTERPORT_SLUG}`}
        className="hero-explore-btn"
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '20px',
          zIndex: 2,
          display: 'none',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
          background: 'rgba(11,11,11,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(200,164,93,0.4)',
          color: '#F7F5F2',
          borderRadius: '999px',
          padding: '10px 16px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        {t('Explorer', 'Explore')} <span aria-hidden="true">→</span>
      </Link>

      {/* ── Progression du diaporama : 5 traits fins en bas ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '36px',
          zIndex: 2,
          display: 'flex',
          gap: '8px',
        }}
        className="hero-progress"
      >
        {SLIDES.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === index ? '28px' : '14px',
              height: '2px',
              borderRadius: '2px',
              backgroundColor:
                i === index ? colors.gold : 'rgba(247,245,242,0.25)',
              transition: 'all 0.5s ease',
            }}
          />
        ))}
      </div>

      <style>{`
        .hero-cta-primary:hover {
          box-shadow: 0 0 32px rgba(200,164,93,0.45);
          transform: translateY(-2px);
        }
        .hero-cta-ghost:hover {
          background: rgba(255,255,255,0.12) !important;
          border-color: rgba(200,164,93,0.6) !important;
        }
        @media (max-width: 640px) {
          .hero-progress { display: none !important; }
          .hero-h1 { font-weight: 300 !important; }
          /* Évite que le drag tactile sur le Matterport capture le scroll de la page. */
          .hero-matterport { pointer-events: none; }
          .hero-explore-btn { display: inline-flex !important; }
        }
      `}</style>
    </section>
  );
}
