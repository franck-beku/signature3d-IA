'use client'

import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Hero from '@/components/site/Hero'
import Manifeste from '@/components/site/Manifeste'
import NosUnivers from '@/components/site/NosUnivers'
import Luxedia from '@/components/site/Luxedia'
import Demo8020 from '@/components/site/Demo8020'
import ContactFinal from '@/components/site/ContactFinal'
import Footer from '@/components/site/Footer'
import CommentCaMarche from '@/components/site/CommentCaMarche'

// ⏸ Sections V1 (style crème) à refaire en premium — temporairement retirées :
// import CommentCaMarche from '@/components/site/CommentCaMarche'
// import Realisations from '@/components/site/Realisations'
// import PreuveSociale from '@/components/site/PreuveSociale'
// import PourquoiNous from '@/components/site/PourquoiNous'
// import ContactForm from '@/components/site/ContactForm'

export default function Home() {
  const { lang } = useLanguage()

  return (
    <main className="overflow-hidden" key={lang}>
      <Navbar />
      <Hero />
      <Manifeste />
      <NosUnivers />
      <Luxedia />
      <Demo8020 /> 
      <CommentCaMarche />

      {/* ⏸ À refaire en premium avant de réafficher :
      <CommentCaMarche />
      <Realisations />
      <PreuveSociale />
      <PourquoiNous />
      */}

      <ContactFinal />
      <Footer />
    </main>
  )
}