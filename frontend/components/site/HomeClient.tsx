'use client'

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
