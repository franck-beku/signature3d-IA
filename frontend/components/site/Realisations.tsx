/**
 * Réalisations — Signature Immersion (TEASER ACCUEIL).
 *
 * 2 secteurs pour l'instant : Automobile + Immobilier.
 * (Ajouter Restauration / Commerce plus tard, quand de vrais projets existent.)
 *
 * Choix :
 *  - titres génériques par secteur (pas de marque enfermante type "Mercedes")
 *  - image auto sans logo de marque en évidence (vue showroom / profil)
 *  - liens vers les pages SECTEUR existantes (pas de 404)
 *  - images Unsplash réalistes (remplaçables par tes vraies captures plus tard)
 *
 * Grille : 2 colonnes (centrées), passe à 1 colonne en mobile.
 *
 * Place dans l'alternance des fonds :
 *   Nos univers (blanc) → RÉALISATIONS (beige #F1ECE4) → Démo (blanc) → ...
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Box, Car, Home, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const GOLD = '#C8A45D';
const GOLD_DARK = '#A8863F';
const BEIGE = '#F1ECE4';
const CARD = '#FCFBF8';
const INK = '#101010';
const MUTED = '#6B6458';
const BORDER = '#E2D8C8';

type ProjectCard = {
  slug: string;
  href: string;
  sectorFr: string;
  sectorEn: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  image: string;
  icon: LucideIcon;
};

const PROJECTS: ProjectCard[] = [
  {
    slug: 'auto',
    href: '/realisations/automobile',
    sectorFr: 'Automobile',
    sectorEn: 'Automotive',
    titleFr: 'Showroom automobile',
    titleEn: 'Automotive showroom',
    descriptionFr:
      'Chaque véhicule mis en valeur dans une expérience immersive, explorable sous tous les angles.',
    descriptionEn:
      'Every vehicle showcased in an immersive experience, explorable from every angle.',
    /* Vue de profil / intérieur showroom — pas de calandre ni logo en évidence. */
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=85&auto=format&fit=crop',
    icon: Car,
  },
  {
    slug: 'immobilier',
    href: '/realisations/immobilier',
    sectorFr: 'Immobilier',
    sectorEn: 'Real estate',
    titleFr: 'Propriété de prestige',
    titleEn: 'Prestige property',
    descriptionFr:
      'Une visite immersive qui valorise chaque espace et donne envie de franchir la porte.',
    descriptionEn:
      'An immersive tour that highlights every space and makes you want to step inside.',
    /* Intérieur lumineux, différent de la villa déjà très vue. */
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop',
    icon: Home,
  },
];

const content = {
  fr: {
    label: 'Réalisations récentes',
    title: 'Des projets concrets,',
    title2: 'des expériences qui marquent.',
    subtitle:
      'Chaque projet est pensé pour sublimer un espace et captiver ceux qui le découvrent.',
    seeProject: 'Découvrir le projet',
    all: 'Voir toutes nos réalisations',
    badge: 'Visite 3D',
  },
  en: {
    label: 'Recent work',
    title: 'Concrete projects,',
    title2: 'experiences that resonate.',
    subtitle:
      'Every project is designed to elevate a space and captivate those who explore it.',
    seeProject: 'Discover project',
    all: 'View all projects',
    badge: '3D tour',
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Realisations() {
  const { lang } = useLanguage();
  const c = content[lang];

  return (
    <section
      id="realisations"
      style={{
        backgroundColor: BEIGE,
        padding: '110px 0 120px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 0%, rgba(200,164,93,0.10) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="realisations-header"
        >
          <div>
            <p className="realisations-label">{c.label}</p>

            <h2 className="realisations-title">
              {c.title}
              <br />
              <span>{c.title2}</span>
            </h2>
          </div>

          <div className="realisations-header-right">
            <p>{c.subtitle}</p>

            <Link href="/realisations" className="realisations-all-link">
              {c.all}
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="realisations-grid-custom"
        >
          {PROJECTS.map((project) => {
            const Icon = project.icon;

            return (
              <motion.article
                key={project.slug}
                variants={cardVariants}
                className="card-realisation"
              >
                <Link href={project.href} className="card-link">
                  <div className="card-image-wrap">
                    <img
                      src={project.image}
                      alt={lang === 'fr' ? project.titleFr : project.titleEn}
                      className="card-img"
                    />

                    <div className="card-image-overlay" />

                    <div className="card-badge">
                      <Box size={14} />
                      {c.badge}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="card-icon">
                      <Icon size={25} color="#FFFFFF" strokeWidth={1.5} />
                    </div>

                    <p className="card-sector">
                      {lang === 'fr' ? project.sectorFr : project.sectorEn}
                    </p>

                    <h3>{lang === 'fr' ? project.titleFr : project.titleEn}</h3>

                    <p className="card-description">
                      {lang === 'fr' ? project.descriptionFr : project.descriptionEn}
                    </p>

                    <span className="voir-link">
                      {c.seeProject}
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="realisations-bottom-link">
          <span />
          <Link href="/realisations">
            {c.all}
            <ArrowRight size={18} />
          </Link>
          <span />
        </div>
      </div>

      <style>{`
        .realisations-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 48px;
          margin-bottom: 62px;
        }

        .realisations-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 18px;
        }

        .realisations-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.4rem, 4vw, 4.4rem);
          font-weight: 400;
          color: ${INK};
          letter-spacing: -0.02em;
          line-height: 1.02;
          margin: 0;
        }

        .realisations-title span {
          font-style: italic;
          color: ${GOLD};
        }

        .realisations-header-right p {
          max-width: 390px;
          font-size: 17px;
          line-height: 1.7;
          color: ${MUTED};
          font-weight: 300;
          margin: 0;
        }

        .realisations-all-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: ${INK};
          border: 1px solid rgba(200,164,93,0.75);
          border-radius: 4px;
          padding: 15px 26px;
          margin-top: 26px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .realisations-all-link svg {
          color: ${GOLD};
        }

        .realisations-all-link:hover {
          background-color: ${INK};
          color: #FFFFFF;
          border-color: ${INK};
        }

        /* 2 cartes centrées, largeur maîtrisée pour ne pas les étirer. */
        .realisations-grid-custom {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
          max-width: 880px;
          margin: 0 auto;
        }

        .card-realisation {
          overflow: hidden;
          background-color: ${CARD};
          border: 1px solid ${BORDER};
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.08);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-realisation:hover {
          transform: translateY(-10px);
          box-shadow: 0 38px 96px rgba(0,0,0,0.14);
          border-color: rgba(200,164,93,0.55);
        }

        .card-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .card-image-wrap {
          position: relative;
          height: 320px;
          overflow: hidden;
          background-color: #ddd;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }

        .card-realisation:hover .card-img {
          transform: scale(1.06);
        }

        .card-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(16,16,16,0.48) 0%,
            rgba(16,16,16,0.10) 55%,
            transparent 100%
          );
        }

        .card-badge {
          position: absolute;
          bottom: 18px;
          left: 18px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          background-color: rgba(11,11,11,0.72);
          color: #FFFFFF;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .card-body {
          position: relative;
          padding: 34px 30px 36px;
        }

        .card-icon {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: ${GOLD};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 30px rgba(200,164,93,0.35);
        }

        .card-sector {
          color: ${GOLD};
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 12px 0 14px;
        }

        .card-body h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.9rem, 2.4vw, 2.55rem);
          font-weight: 400;
          color: ${INK};
          line-height: 1.08;
          margin: 0 0 14px;
        }

        .card-description {
          font-size: 15px;
          line-height: 1.75;
          color: ${MUTED};
          margin: 0 0 28px;
        }

        .voir-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: ${GOLD};
          transition: gap 0.25s ease, color 0.25s ease;
        }

        .card-realisation:hover .voir-link {
          gap: 16px;
          color: ${GOLD_DARK};
        }

        .realisations-bottom-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 54px;
        }

        .realisations-bottom-link span {
          width: 140px;
          height: 1px;
          background: rgba(200,164,93,0.45);
        }

        .realisations-bottom-link a {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: ${INK};
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: color 0.25s ease, gap 0.25s ease;
        }

        .realisations-bottom-link a:hover {
          color: ${GOLD};
          gap: 20px;
        }

        @media (max-width: 980px) {
          .realisations-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .realisations-grid-custom {
            grid-template-columns: 1fr;
            max-width: 460px;
          }

          .realisations-bottom-link span {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
