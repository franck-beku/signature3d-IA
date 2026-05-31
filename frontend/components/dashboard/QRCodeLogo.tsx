/**
 * QRCodeLogo — Composant QR code avec logo Signature 3D IA
 * Utilisé dans la fiche client pour chaque projet
 * Version: 1.0
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, X } from 'lucide-react'

const GOLD = '#d4af37'

interface Props {
  url: string
  projectName: string
  onClose: () => void
}

export default function QRCodeLogo({ url, projectName, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = 400
    canvas.width  = SIZE
    canvas.height = SIZE

    /* 1. Générer QR code sur canvas temporaire */
    const tempCanvas = document.createElement('canvas')
    QRCode.toCanvas(tempCanvas, url, {
      width:  SIZE,
      margin: 2,
      color: { dark: '#1A1400', light: '#FFFFFF' },
      errorCorrectionLevel: 'H', /* H = 30% de récupération → assez pour le logo */
    }, (err) => {
      if (err) return

      /* 2. Dessiner le QR sur le canvas principal */
      ctx.drawImage(tempCanvas, 0, 0, SIZE, SIZE)

      /* 3. Zone blanche au centre pour le logo */
      const logoSize = SIZE * 0.22
      const logoX    = (SIZE - logoSize) / 2
      const logoY    = (SIZE - logoSize) / 2
      const radius   = 10

      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, radius)
      ctx.fill()

      /* 4. Bordure gold autour du logo */
      ctx.strokeStyle = GOLD
      ctx.lineWidth   = 3
      ctx.beginPath()
      ctx.roundRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, radius)
      ctx.stroke()

      /* 5. Charger et dessiner le logo */
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
        setReady(true)
      }
      img.onerror = () => {
        /* Si logo absent — texte "S3D" à la place */
        ctx.fillStyle = GOLD
        ctx.font      = `bold ${logoSize * 0.45}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('S3D', SIZE / 2, SIZE / 2)
        setReady(true)
      }
      img.src = '/logo-dark.png'
    })
  }, [url])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link      = document.createElement('a')
    link.download   = `QR_${projectName.replace(/\s+/g, '_')}.png`
    link.href       = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
      <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ color: 'white', fontWeight: 500, fontSize: '16px', margin: '0 0 4px' }}>QR Code</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{projectName}</p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s ease' }} className="close-btn">
            <X size={14} />
          </button>
        </div>

        {/* Canvas QR */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', display: 'inline-block', marginBottom: '20px' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '260px', height: '260px' }} />
        </div>

        {/* URL */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 4px' }}>URL de l&apos;expérience</p>
          <code style={{ color: GOLD, fontSize: '12px', wordBreak: 'break-all' }}>{url}</code>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleDownload}
            disabled={!ready}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: ready ? GOLD : 'rgba(255,255,255,0.05)', color: ready ? '#000' : 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }}
            className="dl-btn"
          >
            <Download size={14} />
            {ready ? 'Télécharger PNG' : 'Génération...'}
          </button>
          <button onClick={onClose} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
            Fermer
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '16px' }}>
          Le logo Signature 3D IA est intégré au centre du QR code.
        </p>
      </div>

      <style>{`
        .close-btn:hover { color: white !important; }
        .dl-btn:hover:not(:disabled) { background-color: #c9a84c !important; }
      `}</style>
    </div>
  )
}
