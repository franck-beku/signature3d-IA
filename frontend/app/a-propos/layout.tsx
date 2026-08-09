import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos | Signature Immersion',
  description: 'Notre histoire, notre vision et nos valeurs : découvrez comment Signature Immersion transforme des espaces physiques en expériences immersives intelligentes.',
}

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return children
}
