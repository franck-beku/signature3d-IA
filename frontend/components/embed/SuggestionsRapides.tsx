interface SuggestionItem {
  key: string
  label: string
}

interface SuggestionsRapidesProps {
  items: SuggestionItem[]
  onSelect: (key: string) => void
  primaryColor?: string
}

export default function SuggestionsRapides({ items, onSelect, primaryColor = '#d4af37' }: SuggestionsRapidesProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px', justifyContent: 'center' }}>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '999px', border: `1px solid ${primaryColor}4D`, color: primaryColor, backgroundColor: `${primaryColor}0D`, cursor: 'pointer', transition: 'all 0.2s ease' }}
          className="suggestion-btn"
        >
          {item.label}
        </button>
      ))}
      <style>{`.suggestion-btn:hover { background-color: ${primaryColor}26 !important; border-color: ${primaryColor}99 !important; color: ${primaryColor} !important; }`}</style>
    </div>
  )
}
