interface KPICardProps {
  value: string | number
  label: string
  delta?: string
  deltaPositive?: boolean
}

export default function KPICard({ value, label, delta, deltaPositive = true }: KPICardProps) {
  return (
    <div
      style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border)', boxShadow: 'var(--dash-shadow)', borderRadius: '14px', padding: '24px', textAlign: 'center', transition: 'border-color 0.3s ease' }}
      className="kpi-card"
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--dash-text)', marginBottom: '6px', lineHeight: 1 }}>
        {value}
      </div>
      <div className="dash-micro-label" style={{ marginBottom: '8px' }}>
        {label}
      </div>
      {delta && (
        <div style={{ fontSize: '12px', color: deltaPositive ? 'var(--dash-success)' : 'var(--dash-error)' }}>
          {delta}
        </div>
      )}
      <style>{`.kpi-card:hover { border-color: var(--dash-gold-ring) !important; }`}</style>
    </div>
  )
}
