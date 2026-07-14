'use client'

import { getMatterportEmbedUrl } from '@/lib/matterport'

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

      {/* Branding — icône seule, monochrome blanc, recadrée depuis logo-signature.png
          (bbox de l'icône mesurée dans le fichier source 612×408 : x[58,190] y[98,266]) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          width: 'calc(30px * 132 / 168)',
          height: '30px',
          opacity: 0.8,
          backgroundImage: 'url(/logo-signature.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'calc(30px * 612 / 168) calc(30px * 408 / 168)',
          backgroundPosition: 'calc(-30px * 58 / 168) calc(-30px * 98 / 168)',
          filter: 'brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        }}
      />

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