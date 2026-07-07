'use client'

import { Mail, Phone, Calendar, Check, Upload, ExternalLink as OpenIcon } from 'lucide-react'
import type { ClientDto } from '@/lib/api'
import type { PriorityLevel } from '@/lib/priority'

const clientStatusStyle = (s: string) => {
  if (s === 'Actif')   return { bg: 'var(--dash-success-bg)',  color: 'var(--dash-success)' }
  if (s === 'EnCours') return { bg: 'var(--dash-gold-muted)',  color: 'var(--dash-gold)' }
  return                      { bg: 'var(--dash-border)',      color: 'var(--dash-text-subtle)' }
}

/* ── Informations du client ── */
export default function ClientInfoCard({
  client, priority, urgent, onOpenContractModal,
}: {
  client: ClientDto
  priority: PriorityLevel
  urgent: boolean
  onOpenContractModal: () => void
}) {
  const contractSt = clientStatusStyle(client.status)

  return (
    <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '14px', padding: '24px' }}>
      <h2 className="dash-label" style={{ marginBottom: '20px' }}>Informations du client</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }} className="info-grid">
        {[
          { icon: Mail,     label: 'Email',        value: client.email },
          { icon: Phone,    label: 'Téléphone',    value: client.phone ?? '—' },
          { icon: Calendar, label: 'Date contrat', value: new Date(client.contractDate).toLocaleDateString('fr-CA') },
        ].map((info) => (
          <div key={info.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <info.icon size={14} style={{ color: 'var(--dash-gold)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p className="dash-micro-label" style={{ marginBottom: '4px' }}>{info.label}</p>
              <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0 }}>{info.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="info-grid">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Calendar size={14} style={{ color: urgent ? 'var(--dash-error)' : 'var(--dash-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p className="dash-micro-label" style={{ marginBottom: '4px' }}>Date livraison</p>
            <p style={{ color: urgent ? 'var(--dash-error)' : 'var(--dash-text)', fontSize: '13px', margin: 0 }}>
              {new Date(client.deliveryDate).toLocaleDateString('fr-CA')}{urgent && ' ⚠️'}
            </p>
          </div>
        </div>
        <div>
          <p className="dash-micro-label" style={{ marginBottom: '8px' }}>Statut</p>
          <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '999px', backgroundColor: contractSt.bg, color: contractSt.color }}>{client.status}</span>
        </div>
        <div>
          <p className="dash-micro-label" style={{ marginBottom: '8px' }}>Entente / Contrat</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onOpenContractModal}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${client.contractFileUrl ? 'var(--dash-success-ring)' : 'var(--dash-border-input)'}`, color: client.contractFileUrl ? 'var(--dash-success)' : 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }}
              className="upload-btn"
            >
              {client.contractFileUrl ? <Check size={11} /> : <Upload size={11} />}
              {client.contractFileUrl ? 'Contrat uploadé' : 'Uploader PDF'}
            </button>
            {client.contractFileUrl && (
              <a href={client.contractFileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', color: 'var(--dash-text-subtle)', textDecoration: 'none' }} className="action-btn" title="Ouvrir le contrat">
                <OpenIcon size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
      {client.notes && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--dash-border)' }}>
          <p className="dash-micro-label" style={{ marginBottom: '8px' }}>Notes internes</p>
          <div style={{ borderLeft: `3px solid ${priority.borderColor}`, backgroundColor: priority.bgColor, borderRadius: '0 8px 8px 0', padding: '12px 14px' }}>
            <p style={{ color: 'var(--dash-text-subtle)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{client.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
