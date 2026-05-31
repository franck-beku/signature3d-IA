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
  clientCount: number
}

export const sectorsApi = {
  /** Retourne tous les secteurs — utilisé par le site vitrine */
  getAll: () => apiFetch<SectorDto[]>('/api/sectors'),

  /** Retourne un secteur par son slug */
  getBySlug: (slug: string) => apiFetch<SectorDto>(`/api/sectors/${slug}`),
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
  thumbnailUrl?: string
  ambassadorName: string
  welcomeMessage?: string
  status: string
  clientName: string
  embedUrl: string
  buttons: ProjectButtonDto[]
  createdAt: string
}

export const projectsApi = {
  /** Retourne les projets d'un client */
  getByClient: (clientId: string) =>
    apiFetch<ProjectDto[]>(`/api/projects/client/${clientId}`),

  /** Retourne un projet par son slug — utilisé par l'embed */
  getBySlug: (slug: string) =>
    apiFetch<ProjectDto>(`/api/projects/slug/${slug}`),

  /** Crée un nouveau projet */
  create: (data: {
    name: string; matterportId?: string; ambassadorName: string
    welcomeMessage?: string; leadEmail?: string; clientId: string
    buttons: { label: string; url?: string; action: string; order: number }[]
  }) => apiFetch<ProjectDto>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),

  /** Modifie un projet */
  update: (id: string, data: {
    name: string; matterportId?: string; ambassadorName: string
    welcomeMessage?: string; status: string
    buttons: { label: string; url?: string; action: string; order: number }[]
  }) => apiFetch<ProjectDto>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Supprime un projet */
  delete: (id: string) =>
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),
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