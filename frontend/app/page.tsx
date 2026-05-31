'use client'

import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/site/Navbar'
import Hero from '@/components/site/Hero'
import CommentCaMarche from '@/components/site/CommentCaMarche'
import Realisations from '@/components/site/Realisations'
import PreuveSociale from '@/components/site/PreuveSociale'
import PourquoiNous from '@/components/site/PourquoiNous'
import ContactForm from '@/components/site/ContactForm'
import Footer from '@/components/site/Footer'

export default function Home() {
  const { lang } = useLanguage()

  return (
    <main className="overflow-hidden" key={lang}>
      <Navbar />
      <Hero />
      <CommentCaMarche />
      <Realisations />
      <PreuveSociale />
      <PourquoiNous />
      <ContactForm />
      <Footer />
    </main>
  )
}