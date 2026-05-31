interface KPICardProps {
  value: string | number
  label: string
  delta?: string
  deltaPositive?: boolean
}

export default function KPICard({ value, label, delta, deltaPositive = true }: KPICardProps) {
  return (
    <div
      style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', textAlign: 'center', transition: 'border-color 0.3s ease' }}
      className="kpi-card"
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '6px', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </div>
      {delta && (
        <div style={{ fontSize: '12px', color: deltaPositive ? '#4ade80' : '#f87171' }}>
          {delta}
        </div>
      )}
      <style>{`.kpi-card:hover { border-color: rgba(212,175,55,0.2) !important; }`}</style>
    </div>
  )
}
