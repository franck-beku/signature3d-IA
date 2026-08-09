import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Signature Immersion',
  description: "Tout ce qu'il faut savoir sur nos expériences immersives, l'assistant Luxedia et le déroulement d'un projet avec Signature Immersion.",
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
