'use client'

import { getMatterportEmbedUrl } from '@/lib/matterport'
import Image from 'next/image'

interface MatterportViewerProps {
  matterportId: string
  projectName: string
}

export default function MatterportViewer({ matterportId, projectName }: MatterportViewerProps) {
  const embedUrl = getMatterportEmbedUrl(matterportId)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>

      {/* Barre de contexte */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '6px 16px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d4af37', animation: 'pulse 2s infinite', display: 'inline-block' }} />
        <span style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '0.05em' }}>{projectName}</span>
      </div>

      {/* Branding */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10, opacity: 0.6 }}>
        <Image src="/logo-dark.png" alt="Signature 3D IA" width={80} height={26} style={{ height: '20px', width: 'auto' }} />
      </div>

      {/* Iframe */}
      <iframe
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        allow="xr-spatial-tracking"
        title={projectName}
      />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}
