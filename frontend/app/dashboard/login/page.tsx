/**
 * Login — Dashboard Signature 3D IA
 * Version: 3.0 — Thème clair (variables --dash-*), cohérent avec le reste du dashboard
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      /* Appel au vrai backend ASP.NET Core */
      const result = await authApi.login(email, password)

      /* Sauvegarder le token JWT et les infos utilisateur */
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify({
        name:  result.name,
        email: result.email,
        role:  result.role,
      }))

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Email ou mot de passe incorrect.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--dash-input)',
    border: '1px solid var(--dash-border-input)',
    borderRadius: '10px',
    padding: '13px 16px',
    fontSize: '14px',
    color: 'var(--dash-text)' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--dash-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--dash-text)', fontSize: '36px', fontWeight: 300 }}>
              Signature <span style={{ color: 'var(--dash-gold)' }}>Immersion</span>
            </span>
          </div>
          <p className="dash-page-eyebrow" style={{ textAlign: 'center' }}>
            Espace administrateur
          </p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

          {/* Tab */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dash-border)' }}>
            <div style={{ flex: 1, padding: '16px', fontSize: '12px', fontWeight: 500, color: 'var(--dash-gold)', borderBottom: '2px solid var(--dash-gold)', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center' }}>
              Connexion
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '32px 36px' }}>
            <p style={{ color: 'var(--dash-text-muted)', textAlign: 'center', fontSize: '13px', marginBottom: '28px' }}>
              Connectez-vous à votre espace d&apos;administration
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '18px' }}>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Courriel
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={inputStyle}
                  className="dash-input"
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: '24px' }}>
                <label className="dash-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '48px' }}
                    className="dash-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--dash-error-bg)', border: '1px solid var(--dash-error-ring)', borderRadius: '8px', color: 'var(--dash-error)', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', backgroundColor: 'var(--dash-gold)', color: '#000', fontWeight: 600, padding: '14px', borderRadius: '10px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, transition: 'all 0.3s ease' }}
                className="login-btn"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '24px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} Signature Immersion
        </p>
      </div>

      <style>{`
        .login-btn:hover:not(:disabled) { background-color: #b8943d !important; }
        .dash-input:focus { border-color: var(--dash-gold) !important; }
      `}</style>
    </div>
  )
}
