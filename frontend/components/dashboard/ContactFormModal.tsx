'use client'

import { X, Check } from 'lucide-react'
import type { ContactDto, CreateContactDto } from '@/lib/api'

const inputStyle = {
  width: '100%', backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)', borderRadius: '8px',
  padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)' as const,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
}

/* ── Modal Ajouter / Modifier Contact ── */
export default function ContactFormModal({
  editContact, contactForm, contactSaving,
  onChangeEditContact, onChangeContactForm, onCreate, onUpdate, onCloseCreate, onCloseEdit,
}: {
  editContact: ContactDto | null
  contactForm: CreateContactDto
  contactSaving: boolean
  onChangeEditContact: (patch: Partial<ContactDto>) => void
  onChangeContactForm: (patch: Partial<CreateContactDto>) => void
  onCreate: () => void
  onUpdate: () => void
  onCloseCreate: () => void
  onCloseEdit: () => void
}) {
  const isEdit  = !!editContact
  const form    = isEdit ? editContact! : contactForm
  const setForm = isEdit ? onChangeEditContact : onChangeContactForm
  const onSubmit = isEdit ? onUpdate : onCreate
  const onClose  = isEdit ? onCloseEdit : onCloseCreate

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: 0 }}>{isEdit ? 'Modifier le contact' : 'Nouveau contact'}</h2>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn"><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { key: 'name', label: 'Nom *', type: 'text', placeholder: 'Prénom Nom' },
            { key: 'position', label: 'Fonction', type: 'text', placeholder: 'Ex: Directeur marketing' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>{label}</label>
              <input type={type} value={(form as any)[key] ?? ''} onChange={(e) => setForm({ [key]: e.target.value } as any)} placeholder={placeholder} style={inputStyle} className="dash-input" />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
              <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ email: e.target.value })} placeholder="prenom@client.ca" style={inputStyle} className="dash-input" />
            </div>
            <div>
              <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Téléphone</label>
              <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ phone: e.target.value })} placeholder="+1 (418) 000-0000" style={inputStyle} className="dash-input" />
            </div>
          </div>
          <div>
            <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Poste / Extension</label>
            <input type="text" value={form.phoneExtension ?? ''} onChange={(e) => setForm({ phoneExtension: e.target.value })} placeholder="Ex: 224" style={inputStyle} className="dash-input" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${form.isPrimary ? 'var(--dash-gold-ring)' : 'var(--dash-border)'}`, backgroundColor: form.isPrimary ? 'var(--dash-gold-muted)' : 'transparent', transition: 'all 0.2s ease' }}>
            <input type="checkbox" checked={!!form.isPrimary} onChange={(e) => setForm({ isPrimary: e.target.checked })} style={{ width: '15px', height: '15px', accentColor: 'var(--dash-gold)', cursor: 'pointer' }} />
            <span style={{ color: form.isPrimary ? 'var(--dash-gold)' : 'var(--dash-text-subtle)', fontSize: '13px' }}>Contact principal</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={onSubmit}
              disabled={contactSaving || !form.name.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: form.name.trim() ? 'var(--dash-gold)' : 'var(--dash-border)', color: form.name.trim() ? '#000' : 'var(--dash-text-muted)', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: form.name.trim() && !contactSaving ? 'pointer' : 'not-allowed', opacity: contactSaving ? 0.7 : 1 }}
              className="save-btn"
            >
              <Check size={14} /> {contactSaving ? 'Sauvegarde...' : (isEdit ? 'Sauvegarder' : 'Créer')}
            </button>
            <button onClick={onClose} style={{ fontSize: '13px', color: 'var(--dash-text-muted)', background: 'none', border: '1px solid var(--dash-border-input)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  )
}
