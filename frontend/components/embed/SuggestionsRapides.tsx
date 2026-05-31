interface SuggestionsRapidesProps {
  suggestions: string[]
  onSelect: (text: string) => void
}

export default function SuggestionsRapides({ suggestions, onSelect }: SuggestionsRapidesProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px', justifyContent: 'center' }}>
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.8)', backgroundColor: 'rgba(212,175,55,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          className="suggestion-btn"
        >
          {s}
        </button>
      ))}
      <style>{`.suggestion-btn:hover { background-color: rgba(212,175,55,0.15) !important; border-color: rgba(212,175,55,0.6) !important; color: #d4af37 !important; }`}</style>
    </div>
  )
}
