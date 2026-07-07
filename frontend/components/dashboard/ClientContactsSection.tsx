'use client'

import { Plus, UserRound, Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import type { ContactDto } from '@/lib/api'

/* ── Contacts (liste/grille) ── */
export default function ClientContactsSection({
  contacts, deleteContactConfirm, onAddContact, onEditContact, onDeleteConfirm, onCancelDelete, onDelete,
}: {
  contacts: ContactDto[]
  deleteContactConfirm: string | null
  onAddContact: () => void
  onEditContact: (contact: ContactDto) => void
  onDeleteConfirm: (id: string) => void
  onCancelDelete: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '14px', margin: 0 }}>Contacts — {contacts.length}</h2>
        <button onClick={onAddContact} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--dash-gold)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="add-contact-btn">
          <Plus size={12} /> Ajouter un contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 32px', border: '1px dashed var(--dash-border-input)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>Aucun contact pour ce client</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UserRound size={15} style={{ color: 'var(--dash-gold)' }} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', margin: 0 }}>{contact.name}</p>
                    {contact.position && <p style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', margin: '2px 0 0' }}>{contact.position}</p>}
                  </div>
                </div>
                {contact.isPrimary && (
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--dash-gold-muted)', color: 'var(--dash-gold)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Principal</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={11} style={{ color: 'var(--dash-text-muted)', flexShrink: 0 }} />
                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--dash-text-subtle)', fontSize: '12px', textDecoration: 'none' }} className="contact-link">{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={11} style={{ color: 'var(--dash-text-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--dash-text-subtle)', fontSize: '12px' }}>{contact.phone}{contact.phoneExtension ? ` p. ${contact.phoneExtension}` : ''}</span>
                  </div>
                )}
              </div>

              {deleteContactConfirm === contact.id ? (
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--dash-error)', fontSize: '12px', margin: '0 0 10px' }}>Supprimer ce contact ?</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onCancelDelete} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}>Annuler</button>
                    <button onClick={() => onDelete(contact.id)} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', backgroundColor: 'var(--dash-error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => onEditContact(contact)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-gold-ring)', color: 'var(--dash-gold)', background: 'none', cursor: 'pointer' }} className="edit-btn">
                    <Pencil size={10} /> Modifier
                  </button>
                  <button onClick={() => onDeleteConfirm(contact.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dash-error-ring)', color: 'var(--dash-error)', background: 'none', cursor: 'pointer' }} className="delete-btn">
                    <Trash2 size={10} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
