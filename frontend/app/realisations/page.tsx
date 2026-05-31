/**
 * /realisations — Page principale
 * Affiche les secteurs comme grandes cartes premium
 * Clic → /realisations/[secteur]
 */

import Link from 'next/link'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import { projetsData } from '@/config/projets'
import { ArrowRight } from 'lucide-react'

const GOLD = '#D4881E'

/* Images par secteur */
const SECTEUR_IMAGES: Record<string, string> = {
  'Automobile': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=85&auto=format&fit=crop',
  'Restaurant':  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85&auto=format&fit=crop',
  'Immobilier':  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85&auto=format&fit=crop',
  'Hôtellerie':  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
  'Commerce':    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85&auto=format&fit=crop',
}

/* Construit les données secteurs depuis projetsData */
function buildSecteurs() {
  const map: Record<string, { count: number; clients: string[] }> = {}

  Object.values(projetsData).forEach((projet) => {
    if (!map[projet.category]) {
      map[projet.category] = { count: 0, clients: [] }
    }
    map[projet.category].count += projet.experiences.length
    if (!map[projet.category].clients.includes(projet.name)) {
      map[projet.category].clients.push(projet.name)
    }
  })

  return Object.entries(map).map(([name, data]) => ({
    name,
    slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
    image: SECTEUR_IMAGES[name] ?? SECTEUR_IMAGES['Automobile'],
    count: data.count,
    clients: data.clients,
    available: data.count > 0,
  }))
}

const secteurs = buildSecteurs()

export default function RealisationsPage() {
  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: '76px' }}>

        {/* Hero section */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '72px 0 56px' }}>
          <div className="container-main" style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.3em',
              color: GOLD, marginBottom: '16px',
            }}>
              Nos réalisations
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 700, color: '#0A0A0A',
              letterSpacing: '-0.02em', lineHeight: 1.08,
              marginBottom: '20px',
            }}>
              Expériences immersives livrées
            </h1>
            <p style={{
              maxWidth: '520px', margin: '0 auto',
              fontSize: '16px', lineHeight: 1.75,
              color: '#666', fontWeight: 400,
            }}>
              Découvrez nos réalisations par secteur — chaque expérience est unique, personnalisée et accessible depuis n&apos;importe quel appareil.
            </p>
          </div>
        </section>

        {/* Grille secteurs */}
        <section style={{ backgroundColor: '#FAFAF8', padding: '0 0 96px' }}>
          <div className="container-main">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }} className="secteurs-grid">
              {secteurs.map((secteur) => (
                <Link
                  key={secteur.slug}
                  href={secteur.available ? `/realisations/${secteur.slug}` : '#'}
                  style={{
                    display: 'block',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    textDecoration: 'none',
                    /*opacity: secteur.available ? 1 : 0.85,*/
                    transition: 'all 0.35s ease',
                  }}
                  className="secteur-card"
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                    <img
                      src={secteur.image}
                      alt={secteur.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                      className="secteur-img"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                    {/* Compteur expériences */}
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '5px 12px',
                        fontSize: '11px', fontWeight: 600,
                        color: secteur.available ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)',
                      }}>
                        {secteur.available ? (
                          <>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD }} />
                            {secteur.count} expérience{secteur.count > 1 ? 's' : ''}
                          </>
                        ) : (
                          'Prochainement'
                        )}
                      </span>
                    </div>

                    {/* Nom secteur sur l'image */}
                    <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                      <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem', fontWeight: 700,
                        color: '#FFFFFF', margin: 0,
                        letterSpacing: '-0.01em',
                      }}>
                        {secteur.name}
                      </h2>
                    </div>
                  </div>

                  {/* Footer carte */}
                  <div style={{
                    padding: '18px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 500, color: '#444',
                    }}>
                      {secteur.available
                        ? `${secteur.count} expérience${secteur.count > 1 ? 's' : ''} disponible${secteur.count > 1 ? 's' : ''}`
                        : 'Bientôt disponible'}
                    </span>
                    {secteur.available && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.15em',
                        color: GOLD,
                      }}>
                        Voir tout <ArrowRight size={13} />
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <style>{`
        .secteur-card:hover {
          box-shadow: 0 20px 56px rgba(0,0,0,0.12) !important;
          transform: translateY(-4px);
          border-color: rgba(212,136,30,0.2) !important;
        }
        .secteur-card:hover .secteur-img { transform: scale(1.04); }
        @media (max-width: 1024px) { .secteurs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .secteurs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  )
}
