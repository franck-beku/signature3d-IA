/**
 * Client API — Signature Immersion
 * Centralise tous les appels vers le backend ASP.NET Core.
 * En développement : http://localhost:8080
 * En production : https://api.signature3dia.com
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

/** Erreur API — conserve le code HTTP pour permettre de distinguer les erreurs
 *  sûres à afficher (400 validation, 429 rate limit) des pannes techniques opaques. */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

/* ── Helper fetch avec gestion d'erreurs ── */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
    throw new ApiError(error.message ?? `Erreur ${response.status}`, response.status)
  }

  // 204 No Content — pas de body
  if (response.status === 204) return null as T

  return response.json()
}

/* ══════════════════════════════════════
   AUTH
   ══════════════════════════════════════ */

export interface AuthResponse {
  token: string
  name: string
  email: string
  role: string
  expiresAt: string
}

export const authApi = {
  /** Connecte un utilisateur et retourne le token JWT */
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** Retourne les infos de l'utilisateur connecté */
  me: () => apiFetch<{ id: string; name: string; email: string; role: string }>('/api/auth/me'),

  /** Change le mot de passe */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

/* ══════════════════════════════════════
   SECTEURS
   ══════════════════════════════════════ */

export interface SectorDto {
  id: string
  name: string
  slug: string
  imageUrl?: string
  description?: string
  descriptionEn?: string
  coverImage?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  clientCount: number
}

export const sectorsApi = {
  /** PUBLIC — secteurs actifs (site vitrine) */
  getActive: () => apiFetch<SectorDto[]>('/api/sectors'),

  /** PUBLIC — un secteur par slug */
  getBySlug: (slug: string) => apiFetch<SectorDto>(`/api/sectors/${slug}`),

  /** DASHBOARD — tous les secteurs (même inactifs) */
  getAll: () => apiFetch<SectorDto[]>('/api/sectors/all'),

  /** DASHBOARD — créer un secteur */
  create: (data: {
    name: string; imageUrl?: string; description?: string; descriptionEn?: string
    coverImage?: string; icon?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<SectorDto>('/api/sectors', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier un secteur */
  update: (id: string, data: {
    name: string; imageUrl?: string; description?: string; descriptionEn?: string
    coverImage?: string; icon?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<SectorDto>(`/api/sectors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** DASHBOARD — supprimer un secteur */
  delete: (id: string) => apiFetch(`/api/sectors/${id}`, { method: 'DELETE' }),
}

/* ══════════════════════════════════════
   CLIENTS
   ══════════════════════════════════════ */

export interface ClientDto {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  notes?: string
  contractDate: string
  deliveryDate: string
  status: string
  priority: number
  sectorName: string
  sectorSlug: string
  projectCount: number
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export const clientsApi = {
  /** Retourne tous les clients paginés */
  getAll: (page = 1, pageSize = 20) =>
    apiFetch<PagedResult<ClientDto>>(`/api/clients?page=${page}&pageSize=${pageSize}`),

  /** Retourne un client par son slug */
  getBySlug: (slug: string) => apiFetch<ClientDto>(`/api/clients/${slug}`),

  /** Crée un nouveau client */
  create: (data: {
    name: string; email: string; phone?: string; notes?: string
    contractDate: string; deliveryDate: string; status: string
    priority: number; sectorId: string
  }) => apiFetch<ClientDto>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),

  /** Modifie un client */
  update: (id: string, data: Partial<ClientDto & { sectorId: string }>) =>
    apiFetch<ClientDto>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Supprime un client */
  delete: (id: string) =>
    apiFetch(`/api/clients/${id}`, { method: 'DELETE' }),
}

/* ══════════════════════════════════════
   PROJETS
   ══════════════════════════════════════ */

export interface ProjectButtonDto {
  id: string
  label: string
  labelEn?: string
  url?: string
  action: 'link' | 'form' | 'call'
  order: number
}

export interface ProjectSuggestionDto {
  id: string
  label: string
  labelEn?: string
  answer?: string
  answerEn?: string
  order: number
}

export interface ProjectDto {
  id: string
  name: string
  slug: string
  matterportId?: string
  experienceType?: string
  experienceUrl?: string
  thumbnailUrl?: string
  ambassadorName: string
  welcomeMessage?: string
  welcomeMessageEn?: string
  status: string
  clientName: string
  clientId: string
  embedUrl: string
  shortDescription?: string
  shortDescriptionEn?: string
  coverImage?: string
  isPublished: boolean
  isFeatured: boolean
  displayOrder: number
  sectorId?: string
  sectorName?: string
  offeringId?: string
  offeringName?: string
  buttons: ProjectButtonDto[]
  suggestions: ProjectSuggestionDto[]
  details: ProjectDetailDto[]
  createdAt: string
  luxediaPrimaryColor?: string
  luxediaWidgetBgColor?: string
  luxediaBotMessageColor?: string
  luxediaUserMessageColor?: string
  luxediaAvatarUrl?: string
  luxediaClientLogoUrl?: string
  luxediaLanguage?: string
}

export interface ProjectCardDto {
  id: string
  name: string
  slug: string
  coverImage?: string
  matterportId?: string
  shortDescription?: string
  shortDescriptionEn?: string
  isFeatured: boolean
  displayOrder: number
  sectorName?: string
  sectorSlug?: string
  offeringName?: string
  offeringSlug?: string
  details: ProjectDetailDto[]
}

export interface ProjectDetailDto {
  id: string
  label: string
  value: string
  displayOrder: number
  isVisible: boolean
}

export const projectsApi = {
  /** Retourne les projets d'un client */
  getByClient: (clientId: string) =>
    apiFetch<ProjectDto[]>(`/api/projects/client/${clientId}`),

  /** Retourne un projet par son slug — utilisé par l'embed */
  getBySlug: (slug: string) =>
    apiFetch<ProjectDto>(`/api/projects/slug/${slug}`),

  /** DASHBOARD — tous les projets */
  getAll: () => apiFetch<ProjectDto[]>('/api/projects'),
  /** Crée un nouveau projet */
  create: (data: {
    name: string; matterportId?: string; ambassadorName: string
    experienceType?: string; experienceUrl?: string  
    welcomeMessage?: string; welcomeMessageEn?: string; leadEmail?: string; clientId: string
    shortDescription?: string; shortDescriptionEn?: string; coverImage?: string
    isPublished: boolean; isFeatured: boolean; displayOrder: number
    sectorId?: string; offeringId?: string
    buttons: { label: string; labelEn?: string; url?: string; action: string; order: number }[]
    suggestions: { label: string; labelEn?: string; answer?: string; answerEn?: string; order: number }[]
    details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
    luxediaPrimaryColor?: string
    luxediaWidgetBgColor?: string
    luxediaBotMessageColor?: string
    luxediaUserMessageColor?: string
    luxediaAvatarUrl?: string
    luxediaClientLogoUrl?: string
    luxediaLanguage?: string
  }) => apiFetch<ProjectDto>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  
  /** Modifie un projet */
  update: (id: string, data: {
    name: string; matterportId?: string; ambassadorName: string
    experienceType?: string; experienceUrl?: string
    welcomeMessage?: string; welcomeMessageEn?: string; status: string
    shortDescription?: string; shortDescriptionEn?: string; coverImage?: string
    isPublished: boolean; isFeatured: boolean; displayOrder: number
    sectorId?: string; offeringId?: string
    buttons: { label: string; labelEn?: string; url?: string; action: string; order: number }[]
    suggestions: { label: string; labelEn?: string; answer?: string; answerEn?: string; order: number }[]
    details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
    luxediaPrimaryColor?: string
    luxediaWidgetBgColor?: string
    luxediaBotMessageColor?: string
    luxediaUserMessageColor?: string
    luxediaAvatarUrl?: string
    luxediaClientLogoUrl?: string
    luxediaLanguage?: string
  }) => apiFetch<ProjectDto>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  /** Supprime un projet */
  delete: (id: string) =>
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),

  /** PUBLIC — projets vedettes (accueil) */
  getFeatured: () =>
    apiFetch<ProjectCardDto[]>('/api/projects/featured'),

  /** PUBLIC — projets publiés d'un secteur, filtre offre optionnel */
  getBySector: (sectorSlug: string, offering?: string) =>
    apiFetch<ProjectCardDto[]>(
      `/api/projects/by-sector/${sectorSlug}${offering ? `?offering=${offering}` : ''}`
    ),
}

/* ══════════════════════════════════════
   LEADS
   ══════════════════════════════════════ */

export interface LeadDto {
  id: string
  name?: string
  email?: string
  phone?: string
  message?: string
  buttonLabel: string
  status: string
  projectName: string
  clientName: string
  createdAt: string
}

export const leadsApi = {
  /** Retourne tous les leads paginés */
  getAll: (page = 1, pageSize = 20) =>
    apiFetch<PagedResult<LeadDto>>(`/api/leads?page=${page}&pageSize=${pageSize}`),

  /** Retourne les leads d'un projet */
  getByProject: (projectId: string) =>
    apiFetch<LeadDto[]>(`/api/leads/project/${projectId}`),

  /**
   * Crée un lead :
   * - depuis l'embed → avec projectId
   * - depuis le site public (accueil / contact) → SANS projectId (lead « contact général »)
   */
  create: (data: {
    name?: string; email?: string; phone?: string
    message?: string; buttonLabel: string; projectId?: string
  }) => apiFetch<LeadDto>('/api/leads', { method: 'POST', body: JSON.stringify(data) }),

  /** Met à jour le statut d'un lead */
  updateStatus: (id: string, status: string) =>
    apiFetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

/* ══════════════════════════════════════
   CHAT
   ══════════════════════════════════════ */

export interface ChatResponseDto {
  response: string
  sessionToken: string
  buttons: { label: string; url?: string; action: string }[]
}

export const chatApi = {
  /** Envoie un message à Luxedia et retourne la réponse */
  sendMessage: (message: string, projectSlug: string, sessionToken?: string) =>
    apiFetch<ChatResponseDto>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, projectSlug, sessionToken }),
    }),
}

/* ══════════════════════════════════════
   ANALYTICS
   ══════════════════════════════════════ */

export const analyticsApi = {
  /** Retourne les stats d'un projet */
  getByProject: (projectId: string) =>
    apiFetch(`/api/analytics/project/${projectId}`),

  /** Enregistre un événement analytics */
  trackEvent: (eventType: string, projectSlug: string, metadata?: string) =>
    apiFetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventType, projectSlug, metadata }),
    }),
}

/* ══════════════════════════════════════
   VISITES
   ══════════════════════════════════════ */

export const visitsApi = {
  /** Enregistre une visite */
  create: (projectSlug: string, source = 'DirectLink') =>
    apiFetch('/api/visits', {
      method: 'POST',
      body: JSON.stringify({ projectSlug, source }),
    }),

  /** Met à jour la durée d'une visite */
  updateDuration: (visitId: string, durationSeconds: number) =>
    apiFetch(`/api/visits/${visitId}/duration`, {
      method: 'PATCH',
      body: JSON.stringify({ durationSeconds }),
    }),
}

/* ══════════════════════════════════════
   STATS — rapport de preuve client (dashboard)
   ══════════════════════════════════════ */

export interface VisitStatsDto {
  projectId: string
  projectName: string
  total: number
  last30Days: number
  from?: string | null
  to?: string | null
}

export interface ButtonClickStatsDto {
  buttonLabel: string
  clickCount: number
}

export interface ProjectButtonClicksDto {
  projectId: string
  projectName: string
  totalClicks: number
  from?: string | null
  to?: string | null
  buttons: ButtonClickStatsDto[]
}

export interface LeadStatusCountDto {
  status: string
  count: number
}

export interface LeadStatsDto {
  projectId: string
  projectName: string
  total: number
  last30Days: number
  from?: string | null
  to?: string | null
  byStatus: LeadStatusCountDto[]
}

export interface QuestionCategoryStatsDto {
  category: string
  count: number
}

export interface ProjectQuestionStatsDto {
  projectId: string
  projectName: string
  totalQuestions: number
  from?: string | null
  to?: string | null
  categories: QuestionCategoryStatsDto[]
  uncategorizedQuestions: string[]
}

/** Construit ?from=&to= uniquement si fournis */
const statsQuery = (from?: string, to?: string) => {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export const statsApi = {
  /** Statistiques de visites d'un projet */
  getVisits: (projectId: string, from?: string, to?: string) =>
    apiFetch<VisitStatsDto>(`/api/stats/project/${projectId}/visits${statsQuery(from, to)}`),

  /** Clics par bouton d'action, triés décroissant */
  getButtonClicks: (projectId: string, from?: string, to?: string) =>
    apiFetch<ProjectButtonClicksDto>(`/api/stats/project/${projectId}/button-clicks${statsQuery(from, to)}`),

  /** Statistiques de leads, avec découpage par statut */
  getLeads: (projectId: string, from?: string, to?: string) =>
    apiFetch<LeadStatsDto>(`/api/stats/project/${projectId}/leads${statsQuery(from, to)}`),

  /** Questions posées à Luxedia, regroupées par catégorie */
  getQuestions: (projectId: string, from?: string, to?: string) =>
    apiFetch<ProjectQuestionStatsDto>(`/api/stats/project/${projectId}/questions${statsQuery(from, to)}`),
}

/* ══════════════════════════════════════
   EMBED
   ══════════════════════════════════════ */

export interface EmbedData {
  slug: string
  projectName: string
  matterportId: string
  ambassadorName: string
  welcomeMessage: string
  buttons: ProjectButtonDto[]
  embedUrl: string
}

export const embedApi = {
  /** Retourne les données d'une expérience embed */
  getEmbed: (slug: string) =>
    apiFetch<EmbedData>(`/api/embeds/${slug}`),
}

/* ══════════════════════════════════════
   DOCUMENTS
   ══════════════════════════════════════ */

export interface DocumentDto {
  id: string
  name: string
  storageUrl: string
  sizeBytes: number
  isIndexed: boolean
  indexingError?: string
  isInternal: boolean
  chunkCount: number
  createdAt: string
}

export const documentsApi = {
  /** Retourne tous les documents d'un projet */
  getByProject: (projectId: string) =>
    apiFetch<DocumentDto[]>(`/api/documents/project/${projectId}`),

  /** Upload un PDF pour un projet */
  upload: async (projectId: string, file: File, isInternal?: boolean): Promise<DocumentDto> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('isInternal', String(isInternal ?? false))

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/documents/upload/${projectId}`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur upload' }))
      throw new Error(error.message ?? `Erreur ${response.status}`)
    }

    return response.json()
  },

  /** Supprime un document */
  delete: (documentId: string) =>
    apiFetch(`/api/documents/${documentId}`, { method: 'DELETE' }),

  /** Re-indexe un document pour le RAG */
  reindex: (documentId: string) =>
    apiFetch(`/api/documents/${documentId}/index`, { method: 'POST' }),

  /** Bascule un document entre interne et base de connaissances IA */
  setCategory: (documentId: string, isInternal: boolean) =>
    apiFetch(`/api/documents/${documentId}/category`, {
      method: 'PATCH',
      body: JSON.stringify({ isInternal }),
    }),
}

/* ══════════════════════════════════════
   OFFRES (Offerings)
   ══════════════════════════════════════ */

export interface OfferingDto {
  id: string
  name: string
  slug: string
  shortDescription?: string
  shortDescriptionEn?: string
  longDescription?: string
  longDescriptionEn?: string
  icon?: string
  imageUrl?: string
  level?: string
  levelEn?: string
  displayOrder: number
  isActive: boolean
}

export const offeringsApi = {
  /** PUBLIC — offres actives (site vitrine) */
  getActive: () => apiFetch<OfferingDto[]>('/api/offerings'),

  /** PUBLIC — une offre par slug */
  getBySlug: (slug: string) => apiFetch<OfferingDto>(`/api/offerings/${slug}`),

  /** DASHBOARD — toutes les offres */
  getAll: () => apiFetch<OfferingDto[]>('/api/offerings/all'),

  /** DASHBOARD — créer une offre */
  create: (data: {
    name: string; shortDescription?: string; shortDescriptionEn?: string
    longDescription?: string; longDescriptionEn?: string
    icon?: string; imageUrl?: string; level?: string; levelEn?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<OfferingDto>('/api/offerings', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier une offre */
  update: (id: string, data: {
    name: string; shortDescription?: string; shortDescriptionEn?: string
    longDescription?: string; longDescriptionEn?: string
    icon?: string; imageUrl?: string; level?: string; levelEn?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<OfferingDto>(`/api/offerings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** DASHBOARD — supprimer une offre */
  delete: (id: string) => apiFetch(`/api/offerings/${id}`, { method: 'DELETE' }),
}

/* ══════════════════════════════════════
   FAQ
   ══════════════════════════════════════ */

export interface FaqDto {
  id: string
  question: string
  questionEn?: string
  answer: string
  answerEn?: string
  displayOrder: number
  isPublished: boolean
}

export const faqApi = {
  /** PUBLIC — FAQ publiées (site vitrine) */
  getPublished: () => apiFetch<FaqDto[]>('/api/faq'),

  /** DASHBOARD — toutes les FAQ */
  getAll: () => apiFetch<FaqDto[]>('/api/faq/all'),

  /** DASHBOARD — créer une FAQ */
  create: (data: { question: string; questionEn?: string; answer: string; answerEn?: string; displayOrder: number; isPublished: boolean }) =>
    apiFetch<FaqDto>('/api/faq', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier une FAQ */
  update: (id: string, data: { question: string; questionEn?: string; answer: string; answerEn?: string; displayOrder: number; isPublished: boolean }) =>
    apiFetch<FaqDto>(`/api/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** DASHBOARD — supprimer une FAQ */
  delete: (id: string) => apiFetch(`/api/faq/${id}`, { method: 'DELETE' }),
}

/* ══════════════════════════════════════
   CONTACTS
   ══════════════════════════════════════ */

export interface ContactDto {
  id: string
  clientId: string
  name: string
  position?: string
  email?: string
  phone?: string
  phoneExtension?: string
  isPrimary: boolean
}

export interface CreateContactDto {
  name: string
  position?: string
  email?: string
  phone?: string
  phoneExtension?: string
  isPrimary: boolean
}

export interface UpdateContactDto {
  name?: string
  position?: string
  email?: string
  phone?: string
  phoneExtension?: string
  isPrimary?: boolean
}

export const contactsApi = {
  /** Retourne les contacts d'un client */
  getByClient: (clientId: string) =>
    apiFetch<ContactDto[]>(`/api/contacts/client/${clientId}`),

  /** Crée un contact pour un client */
  create: (clientId: string, data: CreateContactDto) =>
    apiFetch<ContactDto>(`/api/contacts/client/${clientId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Modifie un contact */
  update: (id: string, data: UpdateContactDto) =>
    apiFetch<ContactDto>(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Supprime un contact */
  delete: (id: string) =>
    apiFetch(`/api/contacts/${id}`, { method: 'DELETE' }),
}

/* ══════════════════════════════════════
   AGENDA
   ══════════════════════════════════════ */

export type AgendaEventType =
  | 'RendezVousCommercial'
  | 'CaptationMatterport'
  | 'Captation360'
  | 'Livraison'
  | 'Urgent'
  | 'ReunionInterne'
  | 'AppelClient'
  | 'SuiviClient'
  | 'Presentation'
  | 'Validation'
  | 'Autre'

export interface AgendaEventDto {
  id: string
  title: string
  startDateTime: string
  endDateTime?: string
  type: AgendaEventType
  location?: string
  notes?: string
  customType?: string
  createdAt: string
  updatedAt: string
  clientId?: string
  clientName?: string
  projectId?: string
  projectName?: string
  contactId?: string
  contactName?: string
}

export interface CreateAgendaEventDto {
  title: string
  startDateTime: string
  endDateTime?: string
  type: AgendaEventType
  location?: string
  notes?: string
  customType?: string
  clientId?: string
  projectId?: string
  contactId?: string
}

export type UpdateAgendaEventDto = CreateAgendaEventDto

export interface AgendaFilters {
  clientId?: string
  projectId?: string
  from?: string
  to?: string
}

export const agendaApi = {
  /** Retourne tous les événements, avec filtres optionnels */
  getAll: (filters?: AgendaFilters) => {
    const params = new URLSearchParams()
    if (filters?.clientId)  params.set('clientId',  filters.clientId)
    if (filters?.projectId) params.set('projectId', filters.projectId)
    if (filters?.from)      params.set('from',      filters.from)
    if (filters?.to)        params.set('to',        filters.to)
    const qs = params.size > 0 ? `?${params.toString()}` : ''
    return apiFetch<AgendaEventDto[]>(`/api/agenda${qs}`)
  },

  /** Retourne un événement par son id */
  getById: (id: string) =>
    apiFetch<AgendaEventDto>(`/api/agenda/${id}`),

  /** Crée un événement */
  create: (data: CreateAgendaEventDto) =>
    apiFetch<AgendaEventDto>('/api/agenda', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Modifie un événement */
  update: (id: string, data: UpdateAgendaEventDto) =>
    apiFetch<AgendaEventDto>(`/api/agenda/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Supprime un événement */
  delete: (id: string) =>
    apiFetch(`/api/agenda/${id}`, { method: 'DELETE' }),
}

// ─── Timeline ──────────────────────────────────────────────
export interface TimelineItemDto {
  date: string
  type: string
  title: string
  description?: string
  projectId?: string
  projectName?: string
}

export const timelineApi = {
  getByClient: (clientId: string) =>
    apiFetch<TimelineItemDto[]>(`/api/clients/${clientId}/timeline`),
}