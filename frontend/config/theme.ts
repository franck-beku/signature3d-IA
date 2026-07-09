/**
 * Tokens de design — Signature Immersion.
 * Valeurs alignées sur ce qui est réellement utilisé aujourd'hui sur le site
 * (redéfini localement dans ~17 fichiers en attente de migration vers ces tokens).
 * Variantes quasi-identiques encore en circulation : muted #5E5A52 (Manifeste),
 * border #E2D8C8 (CommentCaMarche/Services) et #E8E2D4 (globals.css/ContactForm).
 */
export const colors = {
  gold: '#C8A45D',
  goldDark: '#A8863F',
  cream: '#F7F5F2',
  white: '#FCFBF8',
  charcoal: '#0B0B0B',
  ink: '#101010',
  muted: '#6B6458',
  border: '#E7DED0',
}

/**
 * Accent "signal IA" — réservé exclusivement à ce qui touche Luxedia/l'IA
 * (badges, section Luxedia, cartes Offres liées à l'IA). Ne jamais importer
 * comme couleur générique : c'est un signal sémantique, pas une teinte de palette.
 * Vérifié WCAG : 4.56:1 sur charbon #0B0B0B, 3.97:1 sur crème #F7F5F2.
 */
export const aiSignal = {
  indigo: '#5B6EEA',
}

export const fonts = {
  display: 'var(--font-cormorant)',
  body: 'var(--font-inter)',
  mono: 'var(--font-jetbrains-mono)',
}
