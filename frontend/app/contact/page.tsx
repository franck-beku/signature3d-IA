import Navbar from '@/components/site/Navbar'
import ContactForm from '@/components/site/ContactForm'
import Footer from '@/components/site/Footer'

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
