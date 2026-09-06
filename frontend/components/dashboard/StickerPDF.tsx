/**
 * StickerPDF — Autocollant/panneau QR imprimable (PDF)
 * Rendu vectoriel via @react-pdf/renderer, même famille que ProjectReportPDF.tsx.
 * Le visuel de fond est fixe (design d'Alain) — seul le QR, généré à la volée,
 * varie par projet.
 */

'use client'

import { Document, Page, Image, StyleSheet } from '@react-pdf/renderer'
import QRCode from 'qrcode'

/** Page 150 x 200 mm — ratio 3:4, identique à celui de l'image de fond (1086x1448px),
 *  pour l'afficher sans déformation ni rognage. 1mm = 2.83465pt. */
const PAGE_WIDTH_PT = 425.2
const PAGE_HEIGHT_PT = 566.93

/** Position du QR — mesurée sur l'image de fond (bloc blanc arrondi) :
 *  gauche 27.35%, haut 40.81%, largeur 44.84%, hauteur 33.01%. */
const QR_X = 116.3
const QR_Y = 231.4
const QR_W = 190.7
const QR_H = 187.1

const styles = StyleSheet.create({
  background: { position: 'absolute', top: 0, left: 0, width: PAGE_WIDTH_PT, height: PAGE_HEIGHT_PT },
  qr: { position: 'absolute', left: QR_X, top: QR_Y, width: QR_W, height: QR_H },
})

interface StickerPDFProps {
  qrDataUrl: string
}

export default function StickerPDF({ qrDataUrl }: StickerPDFProps) {
  return (
    <Document>
      <Page size={[PAGE_WIDTH_PT, PAGE_HEIGHT_PT]}>
        <Image src="/signatureImmersion.png" style={styles.background} />
        <Image src={qrDataUrl} style={styles.qr} />
      </Page>
    </Document>
  )
}

/**
 * Génère le QR fonctionnel (avec logo central) en data URL, prêt à être passé
 * en prop à <StickerPDF>. Même technique que QRCodeLogo.tsx (canvas + lib
 * qrcode, errorCorrectionLevel 'H' pour rester scannable malgré le logo).
 */
export async function generateStickerQrDataUrl(targetUrl: string): Promise<string> {
  const SIZE = 400
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  const tempCanvas = document.createElement('canvas')
  await QRCode.toCanvas(tempCanvas, targetUrl, {
    width: SIZE,
    margin: 1,
    color: { dark: '#1A1400', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  })
  ctx.drawImage(tempCanvas, 0, 0, SIZE, SIZE)

  const badgeSize = SIZE * 0.22
  const badgeX = (SIZE - badgeSize) / 2
  const badgeY = (SIZE - badgeSize) / 2
  const radius = 10

  ctx.fillStyle = '#0B0B0B'
  ctx.beginPath()
  ctx.roundRect(badgeX - 8, badgeY - 8, badgeSize + 16, badgeSize + 16, radius)
  ctx.fill()
  ctx.strokeStyle = '#C8A45D'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(badgeX - 8, badgeY - 8, badgeSize + 16, badgeSize + 16, radius)
  ctx.stroke()

  await new Promise<void>((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = '/Newlogo.png'
  })

  return canvas.toDataURL('image/png')
}
