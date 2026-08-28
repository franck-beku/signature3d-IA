'use client'

import { useState } from 'react'
import { ExternalLink, Code, MessageCircle, Check, Copy, X } from 'lucide-react'
import type { ProjectDto } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://signature3dia.com'

/* ── Modal Lien + iframe + widget ── */
export default function ProjectLinkModal({ project, onClose }: { project: ProjectDto; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const directUrl  = `${BASE_URL}/embed/${project.slug}`
  const iframeCode = `<iframe\n  src="${directUrl}"\n  width="420"\n  height="620"\n  style="border: none; border-radius: 12px;"\n  title="${project.name}"\n></iframe>`
  const widgetCode = `<script src="${BASE_URL}/luxedia-widget.js" data-project="${project.slug}"></script>`

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>Partager l&apos;expérience</h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: 0 }}>{project.name}</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--dash-border-input)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-subtle)' }} className="close-btn">
            <X size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ExternalLink size={14} style={{ color: 'var(--dash-gold)' }} />
              <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 600, margin: 0 }}>Lien direct</p>
            </div>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginBottom: '12px', lineHeight: 1.5 }}>Pour QR code, email, réseaux sociaux.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '8px 12px', overflow: 'hidden' }}>
                <code style={{ color: 'var(--dash-gold)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{directUrl}</code>
              </div>
              <button onClick={() => copy(directUrl, 'link')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${copied === 'link' ? 'var(--dash-success-ring)' : 'var(--dash-border-input)'}`, color: copied === 'link' ? 'var(--dash-success)' : 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer', flexShrink: 0 }} className="copy-btn">
                {copied === 'link' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'link' ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Code size={14} style={{ color: 'var(--dash-gold)' }} />
              <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 600, margin: 0 }}>Intégrer sur un site web</p>
            </div>
            <div style={{ backgroundColor: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
              <pre style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>{iframeCode}</pre>
            </div>
            <button onClick={() => copy(iframeCode, 'iframe')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: `1px solid ${copied === 'iframe' ? 'var(--dash-success-ring)' : 'var(--dash-border-input)'}`, color: copied === 'iframe' ? 'var(--dash-success)' : 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="copy-btn">
              {copied === 'iframe' ? <Check size={12} /> : <Copy size={12} />}
              {copied === 'iframe' ? 'Copié !' : 'Copier le code iframe'}
            </button>
          </div>

          {project.luxediaEnabled && (
            <div style={{ backgroundColor: 'var(--dash-input)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <MessageCircle size={14} style={{ color: 'var(--dash-gold)' }} />
                <p style={{ color: 'var(--dash-text)', fontSize: '13px', fontWeight: 600, margin: 0 }}>Widget Luxedia pour site web</p>
              </div>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginBottom: '12px', lineHeight: 1.5 }}>
                Ajoutez Luxedia comme assistant flottant sur le site web du client. Une bulle discrète ouvre une fenêtre de conversation sans remplacer le site.
              </p>
              <div style={{ backgroundColor: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
                <pre style={{ color: 'var(--dash-text-subtle)', fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>{widgetCode}</pre>
              </div>
              <button onClick={() => copy(widgetCode, 'widget')} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: `1px solid ${copied === 'widget' ? 'var(--dash-success-ring)' : 'var(--dash-border-input)'}`, color: copied === 'widget' ? 'var(--dash-success)' : 'var(--dash-text-subtle)', background: 'none', cursor: 'pointer' }} className="copy-btn">
                {copied === 'widget' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'widget' ? 'Copié !' : "Copier le code d'intégration"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
