import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services | Signature Immersion',
  description: "Découvrez nos solutions immersives : visites 3D et 360°, assistant IA Luxedia et diffusion multicanal. Une expérience adaptée à chaque espace et à chaque objectif.",
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
