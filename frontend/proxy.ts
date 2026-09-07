import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Interrupteur de mise en staging — masque le site public marketing tant que
 * PUBLIC_SITE_ENABLED n'est pas explicitement à "true" (défaut : ouvert, pour ne rien
 * changer au comportement actuel tant que la variable n'est pas définie).
 *
 * Le `matcher` ci-dessous liste explicitement les seules pages marketing réelles
 * (allowlist, pas d'exclusion générique) — le dashboard (/dashboard/*), les visites
 * embarquées (/embed/*), les assets (/_next/*, fichiers de /public), robots.txt et
 * sitemap.xml ne sont JAMAIS interceptés par ce proxy, quel que soit l'état du flag :
 * ils ne figurent tout simplement pas dans la liste ci-dessous.
 *
 * Réversibilité : repasser PUBLIC_SITE_ENABLED à "true" (ou la retirer) suffit à
 * retrouver exactement le comportement actuel, sans toucher au code.
 */
export function proxy(request: NextRequest) {
  const isPublicSiteEnabled = process.env.PUBLIC_SITE_ENABLED !== 'false'

  if (isPublicSiteEnabled) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL('/site-en-preparation', request.url))
}

export const config = {
  matcher: [
    '/',
    '/services',
    '/realisations',
    '/realisations/:path*',
    '/contact',
    '/a-propos',
    '/faq',
    '/conditions',
    '/confidentialite',
    '/cookies',
  ],
}
