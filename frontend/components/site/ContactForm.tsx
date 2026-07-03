/**
 * Contact — Signature Immersion
 * Version: 5.0 — Charte V2 (alignée Écran 10) + branché sur la table Leads
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Mail, Phone, MapPin, Clock, UserCheck, Handshake } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { sectorsApi, leadsApi, type SectorDto } from '@/lib/api'

/* ── Charte V2 (identique à Final/Écran 10) ── */
const GOLD = '#C8A45D'
const CREAM = '#F7F5F2'
const INK = '#101010'

const content = {
  fr: {
    label: 'Contact',
    title: <>Prêt à transformer <em style={{ color: GOLD, fontStyle: 'italic' }}>votre espace ?</em></>,
    subtitle: 'Décrivez votre projet — nous vous répondons sous 24h avec une proposition personnalisée.',
    brand: 'Signature Immersion',
    brandTagline: 'Expériences virtuelles — 3D • 360° • IA',
    sectorLabel: 'Secteurs couverts',
    advantages: [
      { icon: Clock,     title: 'Réponse sous 24h',           desc: 'Nous vous recontactons rapidement.' },
      { icon: UserCheck, title: 'Proposition personnalisée',  desc: 'Une solution adaptée à vos objectifs.' },
      { icon: Handshake, title: 'Accompagnement humain',      desc: 'Un conseiller dédié à chaque étape.' },
      { icon: CheckCircle, title: 'Livraison clé en main',    desc: 'De la captation à la mise en ligne.' },
    ],
    fields: {
      name: 'Nom complet', namePh: 'Votre nom',
      email: 'Courriel', emailPh: 'votre@email.com',
      phone: 'Téléphone', phonePh: '+1 (514) 000-0000',
      sector: 'Secteur', sectorPh: 'Sélectionnez un secteur',
      other: 'Autre',
      message: 'Votre projet', messagePh: 'Décrivez votre espace, votre activité et ce que vous souhaitez accomplir...',
    },
    submit: 'Parlons de votre projet',
    submitting: 'Envoi en cours...',
    privacy: 'En soumettant ce formulaire, vous acceptez notre politique de confidentialité.',
    errorMsg: 'Une erreur est survenue. Merci de réessayer.',
    successTitle: 'Message envoyé !',
    successDesc: 'Merci pour votre intérêt. Nous vous contacterons dans les plus brefs délais avec une proposition sur mesure.',
    sectorPrefix: 'Secteur',
    infos: [
      { icon: Mail,   label: 'Email',        value: 'info@signatureimmersion.ca' },
      { icon: Phone,  label: 'Téléphone',    value: '+1 (819) 695-0540' },
      { icon: MapPin, label: 'Localisation', value: 'Trois-Rivières, Québec' },
    ],
  },
  en: {
    label: 'Contact',
    title: <>Ready to transform <em style={{ color: GOLD, fontStyle: 'italic' }}>your space?</em></>,
    subtitle: 'Describe your project — we respond within 24h with a personalized proposal.',
    brand: 'Signature Immersion',
    brandTagline: 'Virtual experiences — 3D • 360° • AI',
    sectorLabel: 'Sectors covered',
    advantages: [
      { icon: Clock,     title: 'Response within 24h',     desc: 'We get back to you quickly.' },
      { icon: UserCheck, title: 'Personalized proposal',   desc: 'A solution tailored to your goals.' },
      { icon: Handshake, title: 'Human guidance',          desc: 'A dedicated advisor at every step.' },
      { icon: CheckCircle, title: 'Turnkey delivery',      desc: 'From capture to going live.' },
    ],
    fields: {
      name: 'Full name', namePh: 'Your name',
      email: 'Email', emailPh: 'your@email.com',
      phone: 'Phone', phonePh: '+1 (514) 000-0000',
      sector: 'Sector', sectorPh: 'Select a sector',
      other: 'Other',
      message: 'Your project', messagePh: 'Describe your space, your activity and what you want to accomplish...',
    },
    submit: "Let's talk about your project",
    submitting: 'Sending...',
    privacy: 'By submitting this form, you agree to our privacy policy.',
    errorMsg: 'Something went wrong. Please try again.',
    successTitle: 'Message sent!',
    successDesc: 'Thank you for your interest. We will contact you shortly with a personalized proposal.',
    sectorPrefix: 'Sector',
    infos: [
      { icon: Mail,   label: 'Email',    value: 'info@signatureimmersion.ca' },
      { icon: Phone,  label: 'Phone',    value: '+1 (819) 695-0540' },
      { icon: MapPin, label: 'Location', value: 'Trois-Rivières, Québec' },
    ],
  },
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.22em',
  color: '#9A8E78', marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: '10px', border: '1.5px solid #EDE7DB',
  backgroundColor: '#FFFFFF', padding: '12px 16px', fontSize: '13.5px',
  color: INK, outline: 'none', transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
}

export default function ContactForm() {
  const { lang } = useLanguage()
  const c = content[lang]

  const [sectors, setSectors] = useState<SectorDto[]>([])
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', sector: '', message: '' })
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Route PUBLIQUE (getActive) — getAll() est protégée et renverrait 401 ici.
    sectorsApi.getActive()
      .then((data) => setSectors(data as SectorDto[]))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    const sectorLabel = formData.sector
      ? sectors.find((s) => s.slug === formData.sector)?.name ?? formData.sector
      : null
    const fullMessage = sectorLabel
      ? `[${c.sectorPrefix} : ${sectorLabel}] ${formData.message}`.trim()
      : formData.message.trim()

    try {
      // Lead « contact général » : pas de projectId (page contact publique).
      await leadsApi.create({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        message: fullMessage || undefined,
        buttonLabel: 'Page contact',
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      style={{
        background: `radial-gradient(120% 90% at 50% 0%, #FFFFFF 0%, ${CREAM} 58%, #F1EEE8 100%)`,
        padding: '104px 0 96px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* halo doré ambiant (comme Final) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(55% 38% at 50% 16%, rgba(200,164,93,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: GOLD }}>{c.label}</span>
            <div style={{ width: '32px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 500, color: INK, letterSpacing: '-0.01em', lineHeight: 1.08, marginBottom: '20px' }}>{c.title}</h2>
          <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75, color: '#6B6458', fontWeight: 400 }}>{c.subtitle}</p>
        </motion.div>

        {/* Bandeau signature de marque (allégé — pas de re-pitch produit) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }}
          style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: '-30% -10%', pointerEvents: 'none',
              background: 'radial-gradient(50% 60% at 50% 50%, rgba(200,164,93,0.14) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              backgroundColor: 'rgba(255,255,255,0.7)',
              border: '1.5px solid rgba(200,164,93,0.22)',
              borderRadius: '18px',
              padding: '22px 28px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 24px 60px -30px rgba(200,164,93,0.35)',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' }}>
              ✦ {c.brand}
            </p>
            <p style={{ fontSize: '13px', color: '#6B6458', margin: 0, letterSpacing: '0.04em' }}>
              {c.brandTagline}
            </p>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.65fr', gap: '56px', alignItems: 'start' }} className="contact-grid">

          {/* Colonne gauche — avantages + coordonnées */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '36px' }}>
              {c.advantages.map((a) => (
                <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#FFFFFF', boxShadow: '0 8px 22px -10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon size={17} style={{ color: GOLD }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: INK, margin: 0 }}>{a.title}</p>
                    <p style={{ fontSize: '12px', color: '#6B6458', margin: '2px 0 0', lineHeight: 1.5 }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', backgroundColor: '#EDE7DB', margin: '0 0 28px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {c.infos.map((info) => (
                <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 30px -18px rgba(0,0,0,0.18)', transition: 'transform 0.25s ease' }} className="info-row">
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, backgroundColor: 'rgba(200,164,93,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <info.icon size={15} style={{ color: GOLD }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: GOLD, margin: 0 }}>{info.label}</p>
                    <p style={{ fontSize: '13px', color: INK, margin: '3px 0 0', fontWeight: 400 }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Secteurs depuis PostgreSQL */}
            <div style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 10px 30px -18px rgba(0,0,0,0.18)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: GOLD, marginBottom: '14px' }}>{c.sectorLabel}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {sectors.map((s) => (
                  <span key={s.id} style={{ backgroundColor: 'rgba(200,164,93,0.06)', border: '1.5px solid rgba(200,164,93,0.18)', borderRadius: '6px', padding: '5px 14px', fontSize: '11px', fontWeight: 600, color: GOLD, letterSpacing: '0.06em' }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Colonne droite — formulaire */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            {sent ? (
              <div style={{ borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 34px 80px -30px rgba(0,0,0,0.2)', padding: '72px 40px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(200,164,93,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={28} strokeWidth={1.4} style={{ color: GOLD }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2.2rem', fontWeight: 500, color: INK, marginBottom: '12px' }}>{c.successTitle}</h3>
                <p style={{ fontSize: '14px', color: '#6B6458', lineHeight: 1.75, fontWeight: 400, maxWidth: '360px', margin: '0 auto' }}>{c.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ borderRadius: '20px', backgroundColor: '#FFFFFF', boxShadow: '0 34px 80px -30px rgba(0,0,0,0.2)', padding: '40px' }}>
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

                {error && (
                  <p style={{ marginBottom: '20px', fontSize: '13px', color: '#B4232A', textAlign: 'center' }}>{error}</p>
                )}

                <div style={{ height: '1px', backgroundColor: '#F0EBE0', marginBottom: '24px' }} />
                <button
                  type="submit" disabled={isSubmitting} className="submit-btn"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    backgroundColor: GOLD, color: '#FFFFFF', borderRadius: '999px', padding: '16px 28px',
                    fontSize: '12px', fontWeight: 700, border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.75 : 1,
                    transition: 'all 0.25s ease', letterSpacing: '0.12em', textTransform: 'uppercase',
                    boxShadow: '0 18px 40px -16px rgba(200,164,93,0.55)',
                  }}
                >
                  {isSubmitting ? c.submitting : c.submit}
                  <Send size={14} />
                </button>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#A89C84', lineHeight: 1.6 }}>{c.privacy}</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        .form-input:focus { border-color: ${GOLD} !important; box-shadow: 0 0 0 3px rgba(200,164,93,0.1) !important; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 22px 48px -16px rgba(200,164,93,0.6) !important; }
        .info-row:hover { transform: translateY(-2px); }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
