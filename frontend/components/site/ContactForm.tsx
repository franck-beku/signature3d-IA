/**
 * Contact — Signature 3D IA
 * Version: 3.0 — Multilingue FR/EN + secteurs depuis PostgreSQL
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { sectorsApi, type SectorDto } from '@/lib/api'

const GOLD      = '#D4881E'
const GOLD_DARK = '#B8720F'
const DARK      = '#1A1400'

const content = {
  fr: {
    label:       'Contact',
    title:       <>Prêt à transformer <em style={{ color: GOLD, fontStyle: 'italic' }}>votre espace ?</em></>,
    subtitle:    'Décrivez votre projet — nous vous répondons sous 24h avec une proposition personnalisée.',
    leftTitle:   'Parlons de votre projet',
    leftDesc:    'Que vous soyez concessionnaire, restaurateur ou promoteur immobilier — nous créons une expérience sur mesure.',
    sectorLabel: 'Secteurs couverts',
    fields: {
      name:      'Nom complet', namePh:    'Votre nom',
      email:     'Courriel',    emailPh:   'votre@email.com',
      phone:     'Téléphone',   phonePh:   '+1 (514) 000-0000',
      sector:    'Secteur',     sectorPh:  'Choisir...',
      other:     'Autre',
      message:   'Votre projet', messagePh: "Décrivez votre espace, votre activité et ce que vous souhaitez accomplir...",
    },
    submit:      'Demander une soumission',
    submitting:  'Envoi en cours...',
    privacy:     'En soumettant ce formulaire, vous acceptez notre politique de confidentialité.',
    successTitle:'Message envoyé !',
    successDesc: 'Merci pour votre intérêt. Nous vous contacterons dans les plus brefs délais avec une proposition sur mesure.',
    infos: [
      { icon: Mail,   label: 'Email',        value: 'info@signature3dia.com' },
      { icon: Phone,  label: 'Téléphone',    value: '+1 (819) 000-0000'      },
      { icon: MapPin, label: 'Localisation', value: 'Trois-Rivières, Québec' },
      { icon: Clock,  label: 'Réponse',      value: 'Sous 24h garantie'      },
    ],
  },
  en: {
    label:       'Contact',
    title:       <>Ready to transform <em style={{ color: GOLD, fontStyle: 'italic' }}>your space?</em></>,
    subtitle:    'Describe your project — we respond within 24h with a personalized proposal.',
    leftTitle:   "Let's talk about your project",
    leftDesc:    'Whether you are a car dealer, restaurateur or real estate developer — we create a tailor-made experience.',
    sectorLabel: 'Sectors covered',
    fields: {
      name:      'Full name',   namePh:    'Your name',
      email:     'Email',       emailPh:   'your@email.com',
      phone:     'Phone',       phonePh:   '+1 (514) 000-0000',
      sector:    'Sector',      sectorPh:  'Choose...',
      other:     'Other',
      message:   'Your project', messagePh: 'Describe your space, your activity and what you want to accomplish...',
    },
    submit:      'Request a quote',
    submitting:  'Sending...',
    privacy:     'By submitting this form, you agree to our privacy policy.',
    successTitle:'Message sent!',
    successDesc: 'Thank you for your interest. We will contact you shortly with a personalized proposal.',
    infos: [
      { icon: Mail,   label: 'Email',    value: 'info@signature3dia.com' },
      { icon: Phone,  label: 'Phone',    value: '+1 (819) 000-0000'      },
      { icon: MapPin, label: 'Location', value: 'Trois-Rivières, Québec' },
      { icon: Clock,  label: 'Response', value: 'Within 24h guaranteed'  },
    ],
  },
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.22em',
  color: '#8A7A5A', marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: '8px', border: '1.5px solid #E8E2D4',
  backgroundColor: '#FFFFFF', padding: '12px 16px', fontSize: '13.5px',
  color: DARK, outline: 'none', transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
}

export default function ContactForm() {
  const { lang } = useLanguage()
  const c = content[lang]

  const [sectors, setSectors]       = useState<SectorDto[]>([])
  const [formData, setFormData]     = useState({ name: '', email: '', phone: '', sector: '', message: '' })
  const [sent, setSent]             = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    sectorsApi.getAll()
      .then((data) => setSectors(data as SectorDto[]))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
    setIsSubmitting(false)
  }

  return (
    <section id="contact" style={{ backgroundColor: '#FAFAF8', padding: '104px 0 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(212,136,30,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD }}>{c.label}</span>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>{c.title}</h2>
          <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75, color: '#6B6458', fontWeight: 300 }}>{c.subtitle}</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.65fr', gap: '56px', alignItems: 'start' }} className="contact-grid">

          {/* Colonne gauche */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 300, color: DARK, marginBottom: '12px', lineHeight: 1.2 }}>{c.leftTitle}</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.8, color: '#6B6458', marginBottom: '40px', fontWeight: 300 }}>{c.leftDesc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
              {c.infos.map((info) => (
                <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1.5px solid #E8E2D4', transition: 'border-color 0.25s ease' }} className="info-row">
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, backgroundColor: '#F5F0E8', border: '1px solid #E8E2D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <info.icon size={15} style={{ color: GOLD_DARK }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B0A090', margin: 0 }}>{info.label}</p>
                    <p style={{ fontSize: '13px', color: DARK, margin: '3px 0 0', fontWeight: 400 }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Secteurs depuis PostgreSQL */}
            <div style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #E8E2D4' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#B0A090', marginBottom: '14px' }}>{c.sectorLabel}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {sectors.map((s) => (
                  <span key={s.id} style={{ backgroundColor: 'rgba(212,136,30,0.06)', border: '1.5px solid rgba(212,136,30,0.18)', borderRadius: '6px', padding: '5px 14px', fontSize: '11px', fontWeight: 600, color: GOLD_DARK, letterSpacing: '0.08em' }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Colonne droite — formulaire */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            {sent ? (
              <div style={{ borderRadius: '16px', border: '1.5px solid rgba(212,136,30,0.2)', backgroundColor: '#FFFFFF', padding: '72px 40px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(212,136,30,0.08)', border: '1.5px solid rgba(212,136,30,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={28} strokeWidth={1.3} style={{ color: GOLD }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: DARK, marginBottom: '12px' }}>{c.successTitle}</h3>
                <p style={{ fontSize: '14px', color: '#6B6458', lineHeight: 1.75, fontWeight: 300, maxWidth: '360px', margin: '0 auto' }}>{c.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ borderRadius: '16px', border: '1.5px solid #E8E2D4', backgroundColor: '#FFFFFF', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="form-row">
                  <div>
                    <label style={labelStyle}>{c.fields.name} <span style={{ color: GOLD }}>*</span></label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={c.fields.namePh} style={inputStyle} className="form-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>{c.fields.email} <span style={{ color: GOLD }}>*</span></label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={c.fields.emailPh} style={inputStyle} className="form-input" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="form-row">
                  <div>
                    <label style={labelStyle}>{c.fields.phone}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={c.fields.phonePh} style={inputStyle} className="form-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>{c.fields.sector}</label>
                    <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} style={inputStyle} className="form-input">
                      <option value="">{c.fields.sectorPh}</option>
                      {sectors.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                      <option value="autre">{c.fields.other}</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>{c.fields.message}</label>
                  <textarea rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder={c.fields.messagePh} style={{ ...inputStyle, resize: 'none', lineHeight: 1.65 }} className="form-input" />
                </div>
                <div style={{ height: '1px', backgroundColor: '#F0EBE0', marginBottom: '24px' }} />
                <button type="submit" disabled={isSubmitting} className="submit-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: isSubmitting ? GOLD : DARK, color: '#FFFFFF', borderRadius: '8px', padding: '15px 28px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {isSubmitting ? c.submitting : c.submit}
                  <Send size={13} />
                </button>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#B0A090', lineHeight: 1.6 }}>{c.privacy}</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        .form-input:focus { border-color: ${GOLD} !important; box-shadow: 0 0 0 3px rgba(212,136,30,0.08) !important; }
        .submit-btn:hover:not(:disabled) { background-color: ${GOLD} !important; box-shadow: 0 8px 24px rgba(212,136,30,0.3) !important; transform: translateY(-1px); }
        .info-row:hover { border-color: rgba(212,136,30,0.3) !important; }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
