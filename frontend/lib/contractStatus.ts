/**
 * État calculé du contrat d'un client, à partir de ContractEndDate uniquement.
 * Jamais un statut client (voir ClientStatus) — un client peut rester "Actif" alors que
 * son contrat est "expiré" : le passage à Inactif reste une décision humaine, jamais automatique.
 *
 * Logique centralisée ici pour éviter plusieurs calculs légèrement différents dispersés
 * dans les composants (ClientInfoCard, clients/page.tsx, etc.).
 */

export type ContractState = 'active' | 'expiring-soon' | 'urgent' | 'expiring-today' | 'expired'

export interface ContractStateInfo {
  state: ContractState
  label: string
  color: string
  bgColor: string
  /** Jours restants (négatif si expiré, 0 si expire aujourd'hui) — pour tri/affichage, jamais recalculé ailleurs. */
  daysUntil: number
}

const STATE_STYLES: Record<ContractState, Omit<ContractStateInfo, 'state' | 'daysUntil'>> = {
  'active':          { label: 'Contrat actif',       color: 'var(--dash-success)', bgColor: 'var(--dash-success-bg)' },
  'expiring-soon':   { label: 'Expire bientôt',      color: 'var(--dash-gold)',    bgColor: 'var(--dash-gold-muted)' },
  'urgent':          { label: 'Urgent',              color: '#B0413E',             bgColor: 'rgba(176,65,62,0.10)' },
  'expiring-today':  { label: "Expire aujourd'hui",  color: '#B0413E',             bgColor: 'rgba(176,65,62,0.10)' },
  'expired':         { label: 'Contrat expiré',      color: 'var(--dash-error)',   bgColor: 'var(--dash-error-bg)' },
}

/**
 * Reconstruit la date calendaire "pure" (sans heure, sans fuseau) à partir d'un instant ISO
 * stocké à minuit UTC (ContractDate/DeliveryDate/ContractEndDate viennent d'un <input type="date">
 * — un simple jour calendaire, jamais un instant précis). On lit les composantes UTC plutôt que
 * locales : sinon, un navigateur à l'ouest de l'UTC (ex. Québec) afficherait/comparerait la
 * veille du jour réellement saisi.
 */
function toLocalCalendarDate(iso: string): Date {
  const d = new Date(iso)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Formate une date contractuelle (ou "—" si absente) sans décalage de fuseau. */
export function formatContractDate(iso?: string | null): string {
  if (!iso) return '—'
  return toLocalCalendarDate(iso).toLocaleDateString('fr-CA')
}

/**
 * Calcule l'état du contrat à partir de ContractEndDate uniquement.
 * Retourne null si aucune date de fin n'existe — aucun état n'est inventé.
 *
 *   > 14 jours restants   → active
 *   14 à 3 jours restants → expiring-soon
 *   2 à 1 jour restants   → urgent
 *   0 jour (jour même)    → expiring-today
 *   date dépassée         → expired
 */
export function getContractState(contractEndDate?: string | null): ContractStateInfo | null {
  if (!contractEndDate) return null

  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = toLocalCalendarDate(contractEndDate)
  const diffDays = Math.round((end.getTime() - todayDateOnly.getTime()) / 86_400_000)

  let state: ContractState
  if (diffDays > 14) state = 'active'
  else if (diffDays >= 3) state = 'expiring-soon'
  else if (diffDays >= 1) state = 'urgent'
  else if (diffDays === 0) state = 'expiring-today'
  else state = 'expired'

  return { state, daysUntil: diffDays, ...STATE_STYLES[state] }
}
