'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Hero from '@/components/site/Hero'
import NouvelleFacon from '@/components/site/NouvelleFacon'
import NosUnivers from '@/components/site/NosUnivers'
import Luxedia from '@/components/site/Luxedia'
import CommentCaMarche from '@/components/site/CommentCaMarche'
import RealisationsVedettes from '@/components/site/RealisationsVedettes'
import Temoignages from '@/components/site/Temoignages'
import OffresVedettes from '@/components/site/OffresVedettes'
import Final from '@/components/site/Final'
import Footer from '@/components/site/Footer'

// Sections retirées définitivement (doublons / pas de matière réelle) :
//   PourquoiNous, PreuveSociale

export default function HomeClient() {
  const { lang } = useLanguage()

  // Next.js (App Router) ne scrolle pas de façon fiable vers une ancre de type
  // "/#section" — ni en arrivant d'une autre page, ni en cliquant un lien
  // pointant vers une ancre de la page courante (pushState ne déclenche pas
  // hashchange). On gère donc le scroll manuellement dans les deux cas.
  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = hash.replace('#', '')
      if (!id) return
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    if (window.location.hash) scrollToHash(window.location.hash)

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a[href^="/#"]') as HTMLAnchorElement | null
      if (!anchor) return
      scrollToHash(anchor.getAttribute('href')!.slice(1))
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <main className="overflow-hidden" key={lang}>
      <Navbar />
      <Hero />
      <NouvelleFacon />
      <NosUnivers />
      <Luxedia />
      <CommentCaMarche />
      <RealisationsVedettes />
      <Temoignages />
      <OffresVedettes />
      <Final />
      <Footer />
    </main>
  )
}
