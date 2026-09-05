import type { MetadataRoute } from 'next'

/* Même variable que celle déjà réservée (inutilisée jusqu'ici) dans .env.local — repli sur
   localhost en dev, à renseigner en production (traité séparément, cf. audit — NEXT_PUBLIC_API_URL). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * robots.txt — Signature Immersion (site public).
 * Le site public est indexable normalement. Exclusions :
 *  - /dashboard : back-office admin (authentifié), aucune valeur pour la recherche publique.
 *  - /embed     : pages de visite immersive par client/projet (mercedes-voiture-1, etc.) —
 *                 destinées à être partagées par lien direct/QR code ou intégrées en iframe
 *                 chez le client, pas à être découvertes via une recherche Google sous le
 *                 domaine Signature Immersion.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/embed'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
