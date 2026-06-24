'use client'

import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Hero from '@/components/site/Hero'
import Manifeste from '@/components/site/Manifeste'
import NosUnivers from '@/components/site/NosUnivers'
import Realisations from '@/components/site/Realisations'
import Demo8020 from '@/components/site/Demo8020'
import CommentCaMarche from '@/components/site/CommentCaMarche'
import Services from '@/components/site/Services'
import Final from '@/components/site/Final'
import Footer from '@/components/site/Footer'

// À refaire en premium avant de réafficher sur l'accueil :
//   Realisations (teaser « preuve avant tech » → lien vers la page /realisations)
// Sections retirées définitivement (doublons / pas de matière réelle) :
//   PourquoiNous, PreuveSociale

export default function Home() {
  const { lang } = useLanguage()

  return (
    <main className="overflow-hidden" key={lang}>
      <Navbar />
      <Hero />
      <Manifeste />
      <NosUnivers />
      <Realisations />
      <Demo8020 />
      <CommentCaMarche />
      <Services />
      <Final />
      <Footer />
    </main>
  )
}
