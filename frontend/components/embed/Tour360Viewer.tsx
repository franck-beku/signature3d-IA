'use client'

import Image from 'next/image'

interface Tour360ViewerProps {
  experienceUrl: string
  projectName: string
}

export default function Tour360Viewer({ experienceUrl, projectName }: Tour360ViewerProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>

      {/* Barre de contexte */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '6px 16px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d4af37', animation: 'pulse 2s infinite', display: 'inline-block' }} />
        <span style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '0.05em' }}>{projectName}</span>
      </div>

      {/* Branding */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10, opacity: 0.85 }}>
        <Image src="/logo-dark.png" alt="Signature Immersion" width={120} height={39} style={{ height: '40px', width: 'auto' }} />
      </div>

      {/* Iframe 360° (Glo3D, Kuula, Pano2VR...) */}
      <iframe
        src={experienceUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        allow="xr-spatial-tracking; accelerometer; gyroscope"
        title={projectName}
      />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}