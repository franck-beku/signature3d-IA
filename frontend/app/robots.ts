import type { MetadataRoute } from 'next'

/* Même variable que celle déjà réservée (inutilisée jusqu'ici) dans .env.local — repli sur
   localhost en dev, à renseigner en production (traité séparément, cf. audit — NEXT_PUBLIC_API_URL). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// robots.js est mis en cache/prérendu statiquement par défaut (voir doc Next.js) — sans ceci,
// PUBLIC_SITE_ENABLED ne serait lu qu'au build et non à chaque requête, rendant l'interrupteur
// de staging inopérant à l'exécution (il faudrait rebuilder pour changer d'état).
export const dynamic = 'force-dynamic'

/**
 * robots.txt — Signature Immersion (site public).
 * Le site public est indexable normalement. Exclusions :
 *  - /dashboard : back-office admin (authentifié), aucune valeur pour la recherche publique.
 *  - /embed     : pages de visite immersive par client/projet (mercedes-voiture-1, etc.) —
 *                 destinées à être partagées par lien direct/QR code ou intégrées en iframe
 *                 chez le client, pas à être découvertes via une recherche Google sous le
 *                 domaine Signature Immersion.
 *
 * Mode staging (PUBLIC_SITE_ENABLED=false, voir proxy.ts) : le site public est masqué
 * derrière une page d'attente — interdiction totale d'indexation le temps du staging,
 * aucun sitemap publié. Le dashboard reste hors de portée des robots dans les deux cas
 * (jamais listé dans un `allow`).
 */
export default function robots(): MetadataRoute.Robots {
  const isPublicSiteEnabled = process.env.PUBLIC_SITE_ENABLED !== 'false'

  if (!isPublicSiteEnabled) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/embed'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
