/**
 * Page Embed — Signature Immersion
 * Version: 4.0 — Connecté au backend PostgreSQL + Groq IA + experienceType (Matterport/Tour360/IAOnly)
 */

import { notFound } from 'next/navigation'
import EmbedInterface from '@/components/embed/EmbedInterface'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

interface EmbedData {
  slug:           string
  projectName:    string
  matterportId:   string
  experienceType: string          // 'Matterport' | 'Tour360' | 'IAOnly'
  experienceUrl:  string | null    // URL iframe pour Tour360 (Glo3D, etc.)
  luxediaEnabled: boolean          // false = widget Luxedia désactivé (visite seule)
  ambassadorName: string
  welcomeMessage: string
  welcomeMessageEn?: string | null
  buttons: {
    id:     string
    label:  string
    labelEn?: string | null
    url?:   string
    action: 'link' | 'form' | 'call'
    order:  number
  }[]
  suggestions: {
    id:       string
    label:    string
    labelEn?: string | null
    answer?:  string | null
    answerEn?: string | null
    order:    number
  }[]
  luxediaAvatarUrl?:       string | null
  luxediaClientLogoUrl?:   string | null
  luxediaPrimaryColor?:    string | null
  luxediaWidgetBgColor?:   string | null
  luxediaBotMessageColor?: string | null
  luxediaUserMessageColor?: string | null
  luxediaLanguage?:        string | null
}

/**
 * Retourne null uniquement pour un vrai 404 (slug inexistant OU projet non publié —
 * EmbedsController renvoie la même forme de réponse pour les deux). Toute autre erreur
 * (5xx, réseau, timeout) est volontairement laissée se propager : c'est une panne
 * technique, pas une absence d'expérience — app/embed/error.tsx la prendra en charge,
 * distinctement de app/embed/not-found.tsx.
 */
async function getEmbedData(slug: string): Promise<EmbedData | null> {
  const res = await fetch(`${API_URL}/api/embeds/${slug}`, {
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Échec du chargement de l'expérience embed (HTTP ${res.status}).`)
  return res.json()
}

export default async function EmbedSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug }  = await params
  const { mode }  = await searchParams
  const project   = await getEmbedData(slug)

  if (!project) {
    notFound()
  }

  return (
    <EmbedInterface
      mode={typeof mode === 'string' ? mode : undefined}
      matterportId={project.matterportId ?? ''}
      experienceType={project.experienceType}
      experienceUrl={project.experienceUrl}
      luxediaEnabled={project.luxediaEnabled}
      projectName={project.projectName}
      ambassadorName={project.ambassadorName}
      welcomeMessage={project.welcomeMessage || `Bienvenue ! Je suis ${project.ambassadorName}, votre assistant intelligent.`}
      welcomeMessageEn={project.welcomeMessageEn ?? undefined}
      projectSlug={slug}
      buttons={project.buttons
        .sort((a, b) => a.order - b.order)
        .map((b) => ({
          label:  b.label,
          labelEn: b.labelEn ?? null,
          url:    b.url ?? null,
          action: b.action,
        }))}
      suggestions={project.suggestions}
      luxediaAvatarUrl={project.luxediaAvatarUrl ?? undefined}
      luxediaClientLogoUrl={project.luxediaClientLogoUrl ?? undefined}
      luxediaPrimaryColor={project.luxediaPrimaryColor ?? undefined}
      luxediaWidgetBgColor={project.luxediaWidgetBgColor ?? undefined}
      luxediaBotMessageColor={project.luxediaBotMessageColor ?? undefined}
      luxediaUserMessageColor={project.luxediaUserMessageColor ?? undefined}
      luxediaLanguage={project.luxediaLanguage ?? undefined}
    />
  )
}