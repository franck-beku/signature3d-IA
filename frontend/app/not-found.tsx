import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', position: 'relative' }}>

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,175,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'relative' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 300, color: '#d4af37', lineHeight: 1, margin: 0 }}>404</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginTop: '8px', marginBottom: '40px' }}>
          Page introuvable
        </p>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#d4af37', color: '#000', fontSize: '13px', fontWeight: 600, padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s ease' }}
          className="home-btn"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>

      <style>{`.home-btn:hover { background-color: #c9a84c !important; box-shadow: 0 8px 24px rgba(212,175,55,0.25) !important; }`}</style>
    </main>
  )
}
