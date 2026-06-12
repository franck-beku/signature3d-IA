/**
 * Client API — Signature 3D IA
 * Centralise tous les appels vers le backend ASP.NET Core.
 * En développement : http://localhost:5125
 * En production : https://api.signature3dia.com
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'

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
    throw new Error(error.message ?? `Erreur ${response.status}`)
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
    name: string; imageUrl?: string; description?: string
    coverImage?: string; icon?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<SectorDto>('/api/sectors', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier un secteur */
  update: (id: string, data: {
    name: string; imageUrl?: string; description?: string
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
  url?: string
  action: 'link' | 'form' | 'call'
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
  status: string
  clientName: string
  clientId: string
  embedUrl: string
  shortDescription?: string
  coverImage?: string
  isPublished: boolean
  isFeatured: boolean
  displayOrder: number
  sectorId?: string
  sectorName?: string
  offeringId?: string
  offeringName?: string
  buttons: ProjectButtonDto[]
  details: ProjectDetailDto[]
  createdAt: string
}

export interface ProjectCardDto {
  id: string
  name: string
  slug: string
  coverImage?: string
  matterportId?: string
  shortDescription?: string
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
    welcomeMessage?: string; leadEmail?: string; clientId: string
    shortDescription?: string; coverImage?: string
    isPublished: boolean; isFeatured: boolean; displayOrder: number
    sectorId?: string; offeringId?: string
    buttons: { label: string; url?: string; action: string; order: number }[]
    details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
  }) => apiFetch<ProjectDto>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  
  /** Modifie un projet */
  update: (id: string, data: {
    name: string; matterportId?: string; ambassadorName: string
    experienceType?: string; experienceUrl?: string
    welcomeMessage?: string; status: string
    shortDescription?: string; coverImage?: string
    isPublished: boolean; isFeatured: boolean; displayOrder: number
    sectorId?: string; offeringId?: string
    buttons: { label: string; url?: string; action: string; order: number }[]
    details: { label: string; value: string; displayOrder: number; isVisible: boolean }[]
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

  /** Crée un lead depuis l'embed */
  create: (data: {
    name?: string; email?: string; phone?: string
    message?: string; buttonLabel: string; projectId: string
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
   DOCUMENTS — à ajouter dans lib/api.ts
   ══════════════════════════════════════ */

export interface DocumentDto {
  id: string
  name: string
  storageUrl: string
  sizeBytes: number
  isIndexed: boolean
  chunkCount: number
  createdAt: string
}

export const documentsApi = {
  /** Retourne tous les documents d'un projet */
  getByProject: (projectId: string) =>
    apiFetch<DocumentDto[]>(`/api/documents/project/${projectId}`),

  /** Upload un PDF pour un projet */
  upload: async (projectId: string, file: File): Promise<DocumentDto> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'}/api/documents/upload/${projectId}`,
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
}

/* ══════════════════════════════════════
   OFFRES (Offerings)
   ══════════════════════════════════════ */

export interface OfferingDto {
  id: string
  name: string
  slug: string
  shortDescription?: string
  longDescription?: string
  icon?: string
  imageUrl?: string
  level?: string
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
    name: string; shortDescription?: string; longDescription?: string
    icon?: string; imageUrl?: string; level?: string; displayOrder: number; isActive: boolean
  }) => apiFetch<OfferingDto>('/api/offerings', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier une offre */
  update: (id: string, data: {
    name: string; shortDescription?: string; longDescription?: string
    icon?: string; imageUrl?: string; level?: string; displayOrder: number; isActive: boolean
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
  answer: string
  displayOrder: number
  isPublished: boolean
}

export const faqApi = {
  /** PUBLIC — FAQ publiées (site vitrine) */
  getPublished: () => apiFetch<FaqDto[]>('/api/faq'),

  /** DASHBOARD — toutes les FAQ */
  getAll: () => apiFetch<FaqDto[]>('/api/faq/all'),

  /** DASHBOARD — créer une FAQ */
  create: (data: { question: string; answer: string; displayOrder: number; isPublished: boolean }) =>
    apiFetch<FaqDto>('/api/faq', { method: 'POST', body: JSON.stringify(data) }),

  /** DASHBOARD — modifier une FAQ */
  update: (id: string, data: { question: string; answer: string; displayOrder: number; isPublished: boolean }) =>
    apiFetch<FaqDto>(`/api/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** DASHBOARD — supprimer une FAQ */
  delete: (id: string) => apiFetch(`/api/faq/${id}`, { method: 'DELETE' }),
}
