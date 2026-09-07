/**
 * Page de garde — affichée à la place des pages marketing publiques lorsque
 * PUBLIC_SITE_ENABLED=false (voir proxy.ts). Aucune navigation vers le site caché,
 * aucun formulaire, aucune collecte de données — uniquement une page d'attente.
 */

import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Signature Immersion — Site en préparation',
  robots: { index: false, follow: false },
}

export default function SiteEnPreparationPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#0B0B0B',
        color: '#FFFFFF',
      }}
    >
      <Image src="/Newlogo.png" alt="Signature Immersion" width={140} height={115} priority style={{ height: '96px', width: 'auto' }} />
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 300, margin: '0 0 8px' }}>
          Signature <span style={{ color: '#C8A45D' }}>Immersion</span>
        </p>
        <p style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Site en préparation — bientôt disponible
        </p>
      </div>
    </main>
  )
}
