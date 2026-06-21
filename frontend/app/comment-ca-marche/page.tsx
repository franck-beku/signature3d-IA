/**
 * Page Comment ça marche — Signature Immersion
 * Réutilise le composant CommentCaMarche (déjà en charte V2, autonome).
 * Le composant porte son propre en-tête (eyebrow + titre) et son fond charbon.
 */

'use client'

import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import CommentCaMarche from '@/components/site/CommentCaMarche'

export default function CommentCaMarchePage() {
  const { lang } = useLanguage()

  return (
    <main key={lang} style={{ backgroundColor: '#0B0B0B', minHeight: '100vh' }}>
      <Navbar />
      {/* padding-top pour dégager la navbar fixe (68px) ; le composant a déjà 150px internes */}
      <div style={{ paddingTop: '68px' }}>
        <CommentCaMarche />
      </div>
      <Footer />
    </main>
  )
}
