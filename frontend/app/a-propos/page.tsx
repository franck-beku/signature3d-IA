/**
 * Page À propos — Signature Immersion
 * Charte V2 : même gabarit que /faq et /services (Navbar/Footer, header éditorial, CTA final sombre).
 * Contenu 100% statique et bilingue — aucune dépendance API.
 * Réutilise Manifeste.tsx tel quel comme section "Notre manifeste".
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Manifeste from '@/components/site/Manifeste'
import { colors } from '@/config/theme'

/* ── Charte V2 ── */
const WHITE = '#FFFFFF'
const MUTED = '#5A4E3A'

const HISTOIRE_PARAGRAPHS: [string, string][] = [
  [
    "Signature Immersion est née d'une conviction simple : un espace ne devrait pas seulement être vu, il devrait être vécu.",
    'Signature Immersion was born from a simple conviction: a space should not simply be seen, it should be experienced.',
  ],
  [
    "Aujourd'hui, de nombreuses entreprises présentent encore leurs espaces à travers quelques photos ou des vidéos traditionnelles. Pourtant, un lieu possède une histoire, une ambiance et une identité qui méritent d'être découvertes de manière plus immersive.",
    'Today, many businesses still present their spaces through a handful of photos or traditional videos. Yet every place has a story, an atmosphere and an identity that deserve to be discovered in a more immersive way.',
  ],
  [
    "C'est de cette vision qu'est née Signature Immersion : permettre aux entreprises de transformer leurs espaces en expériences interactives grâce aux technologies 3D et 360°.",
    'It is from this vision that Signature Immersion was born: allowing businesses to transform their spaces into interactive experiences through 3D and 360° technologies.',
  ],
  [
    "Au fil du développement de notre solution, une évidence s'est imposée : une expérience immersive devient encore plus riche lorsqu'elle est accompagnée d'une intelligence artificielle capable d'informer, de guider et de répondre aux questions des visiteurs en temps réel.",
    "As we developed our solution, one thing became clear: an immersive experience becomes even richer when paired with artificial intelligence capable of informing, guiding and answering visitors' questions in real time.",
  ],
  [
    "C'est ainsi qu'est née Luxedia, notre assistante intelligente, pensée pour enrichir chaque visite et offrir une expérience plus fluide, plus engageante et plus mémorable.",
    'That is how Luxedia was born, our intelligent assistant, designed to enrich every visit and offer a smoother, more engaging and more memorable experience.',
  ],
  [
    'Aujourd’hui, Signature Immersion accompagne les entreprises qui souhaitent valoriser leurs espaces grâce à des expériences immersives modernes, élégantes et intelligentes.',
    'Today, Signature Immersion supports businesses that want to showcase their spaces through immersive experiences that are modern, elegant and intelligent.',
  ],
]

const VISION_PARAGRAPHS: [string, string][] = [
  [
    "Nous imaginons un monde où chaque entreprise peut faire découvrir ses espaces comme si ses visiteurs s'y trouvaient réellement.",
    'We imagine a world where every business can let visitors discover its spaces as if they were really there.',
  ],
  [
    'Nous croyons que les expériences immersives représentent une nouvelle manière de communiquer, de présenter et de valoriser les lieux.',
    'We believe immersive experiences represent a new way to communicate, present and showcase places.',
  ],
  [
    'Notre ambition est de contribuer à cette transformation en créant des expériences qui rapprochent les entreprises de leurs visiteurs grâce à la technologie, au design et à l’intelligence artificielle.',
    'Our ambition is to contribute to this transformation by creating experiences that bring businesses closer to their visitors through technology, design and artificial intelligence.',
  ],
]

const MISSION_PARAGRAPHS: [string, string][] = [
  [
    'Notre mission est de transformer des espaces physiques en expériences immersives accessibles, élégantes et intelligentes.',
    'Our mission is to transform physical spaces into immersive experiences that are accessible, elegant and intelligent.',
  ],
  [
    'Nous aidons les entreprises à présenter leurs environnements, leurs produits et leurs services de manière plus engageante grâce aux technologies 3D, 360° et à l’intelligence artificielle.',
    'We help businesses present their environments, products and services in a more engaging way through 3D, 360° and artificial intelligence technologies.',
  ],
  [
    'Chaque projet que nous réalisons est conçu pour informer, guider et créer une expérience dont les visiteurs se souviendront.',
    'Every project we build is designed to inform, guide and create an experience visitors will remember.',
  ],
]

const VALEURS: { titleFr: string; titleEn: string; descFr: string; descEn: string }[] = [
  {
    titleFr: "L'expérience avant la technologie",
    titleEn: 'Experience before technology',
    descFr:
      "Nous utilisons la technologie pour créer des expériences humaines, intuitives et mémorables. La technologie n'est jamais une finalité, elle est un moyen au service de l'expérience.",
    descEn:
      'We use technology to create experiences that are human, intuitive and memorable. Technology is never an end in itself — it is a means in service of the experience.',
  },
  {
    titleFr: 'La qualité dans chaque détail',
    titleEn: 'Quality in every detail',
    descFr:
      "Chaque projet est conçu avec soin afin de refléter l'image et les standards de nos clients. Nous accordons une attention particulière à la qualité visuelle, à l'ergonomie et à l'expérience utilisateur.",
    descEn:
      "Every project is crafted with care to reflect our clients' image and standards. We pay particular attention to visual quality, usability and the overall user experience.",
  },
  {
    titleFr: "L'innovation utile",
    titleEn: 'Useful innovation',
    descFr:
      "Nous croyons à l'innovation lorsqu'elle apporte une réelle valeur. C'est pourquoi nous intégrons les technologies immersives et l'intelligence artificielle de manière simple, pertinente et efficace.",
    descEn:
      'We believe in innovation when it brings real value. That is why we integrate immersive technologies and artificial intelligence in a way that is simple, relevant and effective.',
  },
  {
    titleFr: 'La confiance et l’accompagnement',
    titleEn: 'Trust and support',
    descFr:
      'Nous privilégions une relation de proximité avec nos clients. Chaque projet est accompagné avec transparence, écoute et engagement afin de garantir un résultat à la hauteur de leurs attentes.',
    descEn:
      'We favour a close relationship with our clients. Every project is guided with transparency, attentiveness and commitment to deliver a result that meets their expectations.',
  },
]

export default function AProposPage() {
  const { t, lang } = useLanguage()

  return (
    <main
      key={lang}
      style={{
        minHeight: '100vh',
        background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, ${colors.cream} 60%, #F1EEE8 100%)`,
      }}
    >
      <Navbar />

      {/* ── 1. Notre histoire ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '170px', paddingBottom: '90px' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(45% 30% at 30% 12%, rgba(200,164,93,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="container-main" style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="section-eyebrow" style={{ color: colors.gold }}
          >
            {t('À propos', 'About')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              color: colors.ink,
              letterSpacing: '-0.01em',
              marginBottom: '2.2rem',
            }}
          >
            {t('Notre histoire', 'Our story')}
          </motion.h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {HISTOIRE_PARAGRAPHS.map(([fr, en], i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: '1.05rem', lineHeight: 1.85, color: MUTED, fontWeight: 400, margin: 0 }}
              >
                {t(fr, en)}
              </motion.p>
            ))}
          </div>

          {/* ── Phrase d'ancrage, isolée ── */}
          <div id="phrase-ancrage" style={{ marginTop: '4.5rem', textAlign: 'center' }}>
            <div className="section-divider" style={{ margin: '0 auto 2.75rem' }} />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.6rem, 3.2vw, 2.5rem)',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
                color: colors.ink,
                margin: 0,
              }}
            >
              {t('Nous ne vendons pas simplement des visites virtuelles. ', 'We do not simply sell virtual tours. ')}
              <span style={{ color: colors.gold }}>
                {t(
                  "Nous créons des expériences immersives qui permettent aux entreprises d'être découvertes autrement.",
                  'We create immersive experiences that let businesses be discovered in a different way.'
                )}
              </span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. Notre manifeste ── */}
      <Manifeste />

      {/* ── 3. Notre vision ── */}
      <section id="notre-vision" style={{ backgroundColor: WHITE, paddingTop: '120px', paddingBottom: '120px' }}>
        <div className="container-main" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="section-eyebrow" style={{ color: colors.gold }}
          >
            {t('Notre vision', 'Our vision')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: colors.ink,
              marginBottom: '2rem',
            }}
          >
            {t('Voir autrement, vivre pleinement.', 'See differently, live fully.')}
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {VISION_PARAGRAPHS.map(([fr, en], i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: '1.02rem', lineHeight: 1.8, color: MUTED, fontWeight: 400, margin: 0 }}
              >
                {t(fr, en)}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Notre mission ── */}
      <section id="notre-mission" style={{ backgroundColor: colors.cream, borderTop: '1px solid #E7DED0', borderBottom: '1px solid #E7DED0', paddingTop: '120px', paddingBottom: '120px' }}>
        <div className="container-main" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="section-eyebrow" style={{ color: colors.gold }}
          >
            {t('Notre mission', 'Our mission')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: colors.ink,
              marginBottom: '2rem',
            }}
          >
            {t('Transformer chaque espace en expérience.', 'Turning every space into an experience.')}
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {MISSION_PARAGRAPHS.map(([fr, en], i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: '1.02rem', lineHeight: 1.8, color: MUTED, fontWeight: 400, margin: 0 }}
              >
                {t(fr, en)}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Nos valeurs ── */}
      <section id="nos-valeurs" style={{ backgroundColor: WHITE, paddingTop: '120px', paddingBottom: '110px' }}>
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <span className="section-eyebrow" style={{ color: colors.gold }}>
              {t('Nos valeurs', 'Our values')}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontWeight: 500,
                lineHeight: 1.15,
                color: colors.ink,
                margin: 0,
              }}
            >
              {t('Ce qui guide chacun de nos projets.', 'What guides every project we build.')}
            </h2>
          </motion.div>

          <div className="valeurs-grid">
            {VALEURS.map((v, i) => (
              <motion.div
                key={v.titleFr}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="valeur-card"
              >
                <h3>{t(v.titleFr, v.titleEn)}</h3>
                <p>{t(v.descFr, v.descEn)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section id="cta-final-apropos" style={{ backgroundColor: '#0B0B0B', paddingTop: '88px', paddingBottom: '88px' }}>
        <div className="container-main" style={{ textAlign: 'center' }}>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 500,
              color: colors.cream,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {t('Écrivons ensemble votre histoire.', "Let's write your story together.")}
          </motion.h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(247,245,242,0.6)',
            fontWeight: 400,
            maxWidth: '480px',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            {t(
              'Présentez-nous votre espace : nous concevons l’expérience immersive qui lui correspond.',
              'Tell us about your space: we’ll design the immersive experience that fits it.'
            )}
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: colors.gold,
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '15px 34px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 18px 40px -16px rgba(200,164,93,0.55)',
            }}
            className="apropos-cta"
          >
            {t('Demander une démonstration', 'Request a demonstration')}
            <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        .apropos-cta:hover { transform: translateY(-1px); box-shadow: 0 22px 48px -16px rgba(200,164,93,0.6) !important; }

        .valeurs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .valeur-card {
          background: ${colors.cream};
          border: 1px solid #E7DED0;
          border-radius: 18px;
          padding: 36px 34px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .valeur-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.1);
          border-color: rgba(200,164,93,0.4);
        }

        .valeur-card h3 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.3rem, 2vw, 1.55rem);
          font-weight: 500;
          color: ${colors.ink};
          margin: 0 0 12px;
        }

        .valeur-card p {
          font-size: 14.5px;
          line-height: 1.75;
          color: ${MUTED};
          margin: 0;
        }

        @media (max-width: 768px) {
          .valeurs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
