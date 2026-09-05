/**
 * Configuration d'environnement public — Signature Immersion.
 *
 * `NEXT_PUBLIC_API_URL` est inlinée par Next.js au moment du build dans tout bundle qui
 * référence `process.env.NEXT_PUBLIC_API_URL` de façon statique (voir doc Next.js —
 * node_modules/next/dist/docs/01-app/02-guides/environment-variables.md, section
 * "Bundling Environment Variables for the Browser"). Centraliser la valeur ici fonctionne
 * car ce fichier lui-même contient la référence statique : chaque bundle (client ou serveur)
 * qui importe `API_URL` reçoit la valeur déjà inlinée au build, sans lookup dynamique.
 *
 * Dev  : repli sur http://localhost:8080 — port réel du backend en local (Signature3D.Api
 *        écoute sur `PORT` ?? "8080" via `UseUrls`, voir Program.cs ligne ~24-25 ; le port
 *        5125 de launchSettings.json n'est pas utilisé car UseUrls le remplace).
 * Prod : la variable DOIT être définie (Vercel). Sans elle, le frontend appellerait
 *        localhost depuis le navigateur des visiteurs — on échoue donc bruyamment au build
 *        plutôt que de déployer silencieusement une app cassée.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL
  if (fromEnv) return fromEnv

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas défini. Cette variable est obligatoire en production " +
      '(ex. Vercel) : sans elle, le frontend appellerait localhost depuis le navigateur des ' +
      'visiteurs. Définissez-la dans les variables d’environnement du déploiement.'
    )
  }

  return 'http://localhost:8080'
}

export const API_URL = resolveApiUrl()
