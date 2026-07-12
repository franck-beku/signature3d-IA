/**
 * Paramètres — Dashboard Signature 3D IA
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Save, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react'
import { authApi } from '@/lib/api'

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--dash-input)',
  border: '1px solid var(--dash-border-input)',
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '13px',
  color: 'var(--dash-text)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  transition: 'border-color 0.3s ease',
}

const sectionStyle = {
  backgroundColor: 'var(--dash-surface)',
  border: '1px solid var(--dash-border)',
  borderRadius: '14px',
  padding: '24px',
}

export default function ParametresPage() {
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingPwd, setSavingPwd]       = useState(false)
  const [pwdSuccess, setPwdSuccess]     = useState(false)
  const [pwdError, setPwdError]         = useState<string | null>(null)

  const [profile, setProfile] = useState({
    name: '', email: '', role: ''
  })

  const [passwords, setPasswords] = useState({
    current: '', new: '', confirm: ''
  })

  const [notifPrefs, setNotifPrefs] = useState({
    newLead: true, newVisitor: false,
    monthlyReport: true, weeklyDigest: true
  })

  /* Charger le profil depuis localStorage */
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setProfile({
        name:  parsed.name  ?? '',
        email: parsed.email ?? '',
        role:  parsed.role  ?? 'admin',
      })
    }
  }, [])

  /* Sauvegarder le profil via le backend */
  const handleSaveProfile = async () => {
    setProfileError(null)
    setSavingProfile(true)
    try {
      await authApi.updateProfile(profile.name, profile.email)
      const user = JSON.parse(localStorage.getItem('user') ?? '{}')
      localStorage.setItem('user', JSON.stringify({ ...user, name: profile.name, email: profile.email }))
      setSavedProfile(true)
      setTimeout(() => setSavedProfile(false), 3000)
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  /* Changer le mot de passe via le backend */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(false)

    if (!passwords.current) {
      setPwdError('Veuillez entrer votre mot de passe actuel.')
      return
    }
    if (passwords.new.length < 6) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (passwords.new !== passwords.confirm) {
      setPwdError('Les mots de passe ne correspondent pas.')
      return
    }

    setSavingPwd(true)
    try {
      await authApi.changePassword(passwords.current, passwords.new)
      setPwdSuccess(true)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.')
    } finally {
      setSavingPwd(false)
    }
  }

  const notifItems = [
    { key: 'newLead',       label: 'Nouveau lead reçu',   desc: 'Notification quand un visiteur clique sur un bouton' },
    { key: 'newVisitor',    label: 'Nouveau visiteur',     desc: "Notification à chaque ouverture d'une expérience" },
    { key: 'monthlyReport', label: 'Rapport mensuel',      desc: 'Résumé automatique le 1er de chaque mois' },
    { key: 'weeklyDigest',  label: 'Résumé hebdomadaire',  desc: 'Récapitulatif des stats chaque lundi' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--dash-border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--dash-text)', margin: 0 }}>Paramètres</h1>
          <p style={{ marginTop: '4px' }} className="dash-page-eyebrow">
            Compte et préférences
          </p>
        </div>

        <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '760px' }}>

          {/* ── Profil ── */}
          <div style={sectionStyle}>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--dash-border)' }}>
              Informations du compte
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }} className="form-grid">
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nom complet</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Courriel</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={inputStyle} className="dash-input" />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Rôle</label>
                <input type="text" value={profile.role} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Entreprise</label>
                <input type="text" value="Signature 3D IA" disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            {profileError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px', marginBottom: '16px' }}>
                <AlertTriangle size={14} /> {profileError}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', fontWeight: 600, padding: '9px 20px',
                borderRadius: '8px', border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer',
                backgroundColor: savedProfile ? 'var(--dash-success-bg)' : 'var(--dash-gold)',
                color: savedProfile ? 'var(--dash-success)' : '#000',
                outline: savedProfile ? '1px solid var(--dash-success-ring)' : 'none',
                opacity: savingProfile ? 0.7 : 1,
                transition: 'all 0.3s ease',
              }}
              className="save-btn"
            >
              {savedProfile
                ? <><Check size={13} /> Sauvegardé</>
                : <><Save size={13} /> {savingProfile ? 'Sauvegarde...' : 'Sauvegarder le profil'}</>}
            </button>
          </div>

          {/* ── Mot de passe ── */}
          <div style={sectionStyle}>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--dash-border)' }}>
              Changer le mot de passe
            </h2>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {pwdError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px' }}>
                  <AlertTriangle size={14} /> {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--dash-success-bg)', border: '1px solid var(--dash-success-ring)', borderRadius: '8px', color: 'var(--dash-success)', fontSize: '13px' }}>
                  <Check size={14} /> Mot de passe changé avec succès !
                </div>
              )}

              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Mot de passe actuel</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCurrent ? 'text' : 'password'} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '48px' }} className="dash-input" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNew ? 'text' : 'password'} value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '48px' }} className="dash-input" />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>Confirmer le nouveau mot de passe</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" style={inputStyle} className="dash-input" />
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', fontWeight: 600, padding: '9px 20px',
                  borderRadius: '8px', border: 'none',
                  cursor: savingPwd ? 'not-allowed' : 'pointer',
                  backgroundColor: 'var(--dash-gold)', color: '#000',
                  opacity: savingPwd ? 0.7 : 1,
                  width: 'fit-content',
                }}
                className="save-btn"
              >
                <Save size={13} />
                {savingPwd ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>

          {/* ── Notifications ── */}
          <div style={sectionStyle}>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '13px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--dash-border)' }}>
              Notifications
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifItems.map((n, i) => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                  <div>
                    <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0 }}>{n.label}</p>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '2px' }}>{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs({ ...notifPrefs, [n.key]: !notifPrefs[n.key as keyof typeof notifPrefs] })}
                    style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.3s ease', backgroundColor: notifPrefs[n.key as keyof typeof notifPrefs] ? 'var(--dash-gold)' : 'var(--dash-input)' }}
                  >
                    <span style={{ position: 'absolute', top: '4px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.3s ease', left: notifPrefs[n.key as keyof typeof notifPrefs] ? '24px' : '4px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div style={{ ...sectionStyle, border: '1px solid var(--dash-error-ring)' }}>
            <h2 style={{ color: 'var(--dash-error)', fontWeight: 500, fontSize: '13px', marginBottom: '16px' }}>Zone dangereuse</h2>
            <div>
              <p style={{ color: 'var(--dash-text)', fontSize: '13px', margin: 0 }}>Supprimer le compte</p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '2px' }}>Cette action est irréversible — contactez Alain pour confirmer</p>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .save-btn:hover:not(:disabled) { background-color: #b8943d !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
