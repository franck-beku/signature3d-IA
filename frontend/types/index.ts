export interface Project {
  id: string
  clientId: string
  name: string
  matterportId: string
  slug: string
  status: 'draft' | 'active' | 'archived'
  primaryColor: string
  secondaryColor: string
  welcomeMessage?: string
  leadDestination?: string
  ambassadorName: string
  isActive: boolean
  buttons: ProjectButton[]
  createdAt: string
}

export interface ProjectButton {
  id: string
  projectId: string
  label: string
  url?: string
  action: 'link' | 'form' | 'call'
  order: number
}

export interface Client {
  id: string
  name: string
  sector: string
  email?: string
  phone?: string
  logoUrl?: string
  contractDate?: string
  contractStatus: 'en_attente' | 'en_cours' | 'actif' | 'pause'
  priority: 1 | 2 | 3
  notes?: string
  projects: Project[]
}

export interface Lead {
  id: string
  projectId: string
  name: string
  email: string
  phone?: string
  service?: string
  message?: string
  desiredDate?: string
  isSent: boolean
  createdAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}