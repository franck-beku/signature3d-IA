/**
 * Correspondance "nom interne du secteur" (tel que stocké en base, utilisé pour les
 * clés/slugs/lookups existants — ex. `secteur.name`, `SECTEUR_IMAGES[...]`) → libellé
 * public affiché aux visiteurs.
 *
 * Le nom interne ne change JAMAIS ici — aucune migration, aucun impact sur les slugs,
 * les routes, les filtres ou les valeurs API. Seul l'affichage change, et uniquement
 * pour les deux secteurs concernés par ce repositionnement public (validé) :
 *   Automobile  → Automobile + Mobilité   (Automotive + Mobility)
 *   Hôtellerie  → Hébergement + Tourisme  (Accommodation + Tourism)
 * Tout autre secteur passe inchangé.
 */
const SECTOR_PUBLIC_LABEL: Record<string, { fr: string; en: string }> = {
  Automobile: { fr: 'Automobile + Mobilité', en: 'Automotive + Mobility' },
  Hôtellerie: { fr: 'Hébergement + Tourisme', en: 'Accommodation + Tourism' },
}

export function sectorPublicLabel(internalName: string, lang: 'fr' | 'en'): string {
  const mapped = SECTOR_PUBLIC_LABEL[internalName]
  return mapped ? mapped[lang] : internalName
}
