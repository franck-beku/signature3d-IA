/**
 * Page Embed — Signature 3D IA
 * Version: 3.0 — Connecté au backend PostgreSQL + Groq IA
 */

import EmbedInterface from '@/components/embed/EmbedInterface'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'

interface EmbedData {
  slug:           string
  projectName:    string
  matterportId:   string
  ambassadorName: string
  welcomeMessage: string
  buttons: {
    id:     string
    label:  string
    url?:   string
    action: 'link' | 'form' | 'call'
    order:  number
  }[]
}

async function getEmbedData(slug: string): Promise<EmbedData | null> {
  try {
    const res = await fetch(`${API_URL}/api/embeds/${slug}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function EmbedSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }  = await params
  const project   = await getEmbedData(slug)

  if (!project) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0d0d0d',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          backgroundColor: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          Expérience introuvable
        </p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
          Le lien que vous avez utilisé n&apos;est pas valide.
        </p>
      </div>
    )
  }

  return (
    <EmbedInterface
      matterportId={project.matterportId ?? ''}
      projectName={project.projectName}
      ambassadorName={project.ambassadorName}
      welcomeMessage={project.welcomeMessage ?? `Bienvenue ! Je suis ${project.ambassadorName}, votre assistant intelligent.`}
      projectSlug={slug}
      buttons={project.buttons
        .sort((a, b) => a.order - b.order)
        .map((b) => ({
          label:  b.label,
          url:    b.url ?? null,
          action: b.action,
        }))}
    />
  )
}
