/**
 * Login — Dashboard Signature 3D IA
 * Version: 2.0 — Connecté au backend JWT
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
    } catch (err: any) {
      setError(err.message ?? 'Email ou mot de passe incorrect.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '15px 20px',
    fontSize: '14px',
    color: 'white',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,175,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '40px', fontWeight: 300 }}>
              Signature <span style={{ color: '#d4af37' }}>3D IA</span>
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' }}>
            Espace administrateur
          </p>
          <div style={{ width: '48px', height: '1px', backgroundColor: 'rgba(212,175,55,0.4)', margin: '16px auto 0' }} />
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>

          {/* Tab */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ flex: 1, padding: '18px', fontSize: '12px', fontWeight: 500, color: '#d4af37', borderBottom: '2px solid #d4af37', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center' }}>
              Connexion
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '40px 48px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '13px', marginBottom: '32px' }}>
              Connectez-vous à votre espace d&apos;administration
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                  Courriel
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={inputStyle}
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', backgroundColor: '#d4af37', color: '#000', fontWeight: 600, padding: '16px', borderRadius: '12px', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, transition: 'all 0.3s ease' }}
                className="login-btn"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '11px', marginTop: '28px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} Signature 3D IA
        </p>
      </div>

      <style>{`
        .login-btn:hover:not(:disabled) { background-color: #c9a84c !important; box-shadow: 0 8px 24px rgba(212,175,55,0.25) !important; }
      `}</style>
    </div>
  )
}
