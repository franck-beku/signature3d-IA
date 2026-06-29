/**
 * Notifications — Dashboard Signature 3D IA
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--dash-text)', margin: 0 }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
            0 non lues
          </p>
        </div>

        {/* État vide */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Bell size={28} style={{ color: 'var(--dash-gold)' }} />
          </div>
          <p style={{ color: 'var(--dash-text-subtle)', fontSize: '15px', fontWeight: 500, marginBottom: '10px' }}>
            Aucune notification pour le moment
          </p>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', lineHeight: 1.7, maxWidth: '360px' }}>
            Les notifications apparaîtront ici en temps réel dès que quelqu&apos;un visitera vos expériences, cliquera sur un bouton ou soumettra un formulaire.
          </p>

          {/* Info backend */}
          <div style={{ marginTop: '40px', padding: '14px 20px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', borderRadius: '10px', maxWidth: '420px' }}>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
              💡 Les notifications en temps réel seront disponibles après l&apos;intégration du backend PostgreSQL.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
