import type { Metadata } from 'next'
import HomeClient from '@/components/site/HomeClient'

export const metadata: Metadata = {
  title: "Signature Immersion | Visites 3D & 360° augmentées par l'IA",
  description: "Signature Immersion transforme vos espaces en expériences immersives 3D et 360°, enrichies par Luxedia, votre assistante IA disponible 24/7.",
}

export default function Home() {
  return <HomeClient />
}
