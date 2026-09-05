import type { MetadataRoute } from 'next'
import { sectorsApi } from '@/lib/api'

/* Même variable que .env.local (voir robots.ts) — repli localhost en dev. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/* Pages statiques publiques réelles (un dossier par route sous app/) — /dashboard et /embed
   volontairement absents, cf. robots.ts. */
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '',               changeFrequency: 'weekly',  priority: 1 },
  { path: '/realisations',  changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/services',      changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact',       changeFrequency: 'monthly', priority: 0.7 },
  { path: '/a-propos',      changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq',           changeFrequency: 'monthly', priority: 0.5 },
  { path: '/confidentialite', changeFrequency: 'yearly', priority: 0.1 },
  { path: '/conditions',      changeFrequency: 'yearly', priority: 0.1 },
  { path: '/cookies',         changeFrequency: 'yearly', priority: 0.1 },
]

/**
 * sitemap.xml — Signature Immersion (site public).
 * Ajoute aux pages statiques ci-dessus une entrée par secteur actif (/realisations/{slug}),
 * via le même endpoint public que la page /realisations et le sélecteur "Nos univers"
 * (sectorsApi.getActive → GET /api/sectors).
 *
 * Le backend n'est PAS interrogé au build : si l'appel échoue (API indisponible pendant le
 * build/déploiement), on retombe silencieusement sur les seules pages statiques plutôt que de
 * faire échouer tout le build — un sitemap incomplet vaut mieux qu'un déploiement bloqué.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const sectors = await sectorsApi.getActive()
    const sectorEntries: MetadataRoute.Sitemap = sectors.map((sector) => ({
      url: `${SITE_URL}/realisations/${sector.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    return [...staticEntries, ...sectorEntries]
  } catch {
    return staticEntries
  }
}
