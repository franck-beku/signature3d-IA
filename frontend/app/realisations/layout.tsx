import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réalisations | Signature Immersion',
  description: 'Découvrez nos réalisations par secteur — automobile, immobilier, restauration, hôtellerie et commerce. Chaque expérience immersive est unique et accessible depuis tout appareil.',
}

export default function RealisationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
