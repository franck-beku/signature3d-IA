import type { Metadata } from 'next'
import Navbar from '@/components/site/Navbar'
import ContactForm from '@/components/site/ContactForm'
import Footer from '@/components/site/Footer'

export const metadata: Metadata = {
  title: 'Contact | Signature Immersion',
  description: 'Décrivez votre projet — Signature Immersion vous répond sous 24h avec une proposition personnalisée pour transformer votre espace.',
}

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <ContactForm />
      </div>
      <Footer />
    </main>
  )
}
