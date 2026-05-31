/**
 * config/projets.ts — Source unique de vérité
 * Signature 3D IA
 *
 * ARCHITECTURE:
 * - Toutes les données client/expérience ici
 * - Quand backend prêt: remplacer par fetch API PostgreSQL
 * - Le reste du code ne change pas
 *
 * CHAMPS PAR EXPÉRIENCE:
 * - matterportId: ID du scan Matterport (thumbnail auto-généré)
 * - prix/kilometrage: optionnels (secteur automobile)
 * - thumbnail: auto-généré depuis matterportId si absent
 */

/* ─── Interfaces ─── */

export interface Experience {
  id: string
  name: string
  description: string
  matterportId: string
  slug: string
  /* Champs optionnels selon secteur */
  prix?: string
  kilometrage?: string
  /* Thumbnail custom (si absent: thumbnail Matterport auto) */
  thumbnailUrl?: string
}

export interface Projet {
  name: string
  description: string
  category: string
  experiences: Experience[]
}

/* ─── Helper: thumbnail Matterport automatique ─── */
export function getMatterportThumb(matterportId: string): string {
  return `https://my.matterport.com/api/v1/player/models/${matterportId}/thumb`
}

/* ─── Données clients & expériences ─── */

export const projetsData: Record<string, Projet> = {

  /* ══════════════════════════════
     CLIENT: Mercedes Québec
     Secteur: Automobile
     3 expériences Matterport réelles
  ══════════════════════════════ */
  'mercedes-quebec': {
    name: 'Mercedes Québec',
    description: 'Découvrez notre showroom en 3D et explorez chaque véhicule avec notre Ambassadeur IA.',
    category: 'Automobile',
    experiences: [
      {
        id: '1',
        name: 'Mercedes CLE 53 AMG',
        description: 'Cabriolet sport haute performance',
        matterportId: 'WJzvgHF44zq',
        slug: 'mercedes-voiture-1',
        prix: '53 900 $',
        kilometrage: '22 543 KM',
      },
      {
        id: '2',
        name: 'Mercedes Showroom',
        description: 'Visite complète du showroom',
        matterportId: 'Fg8etsLyrWz',
        slug: 'mercedes-voiture-2',
        prix: '45 874 $',
        kilometrage: '34 214 KM',
      },
      {
        id: '3',
        name: 'Mercedes Collection',
        description: 'Collection de véhicules premium',
        matterportId: 'gTHjEVgJEbZ',
        slug: 'mercedes-voiture-3',
        prix: '78 000 $',
        kilometrage: '21 001 KM',
      },
    ],
  },

  /* ══════════════════════════════
     CLIENT: Restaurant Bella
     Secteur: Restaurant
     En attente d'expériences
  ══════════════════════════════ */
  'restaurant-bella': {
    name: 'Restaurant Bella',
    description: 'Visitez nos espaces avant de réserver votre table.',
    category: 'Restaurant',
    experiences: [],
  },

  /* ══════════════════════════════
     CLIENT: Immo Prestige
     Secteur: Immobilier
     En attente d'expériences
  ══════════════════════════════ */
  'immo-prestige': {
    name: 'Immo Prestige',
    description: 'Visitez nos propriétés depuis chez vous.',
    category: 'Immobilier',
    experiences: [],
  },

  'hotellerie': {
  name: 'Hôtellerie',
  description: 'Visitez nos établissements depuis chez vous.',
  category: 'Hôtellerie',
  experiences: [],
},
'commerce': {
  name: 'Commerce',
  description: 'Explorez nos espaces commerciaux en 3D.',
  category: 'Commerce',
  experiences: [],
},
}

/* ─── Embed data (chatbot config par slug) ─── */

export const embedData: Record<string, {
  matterportId: string
  projectName: string
  ambassadorName: string
  welcomeMessage: string
  buttons: { label: string; url: string | null; action: 'link' | 'form' | 'call' }[]
}> = {
  'mercedes-voiture-1': {
    matterportId: 'WJzvgHF44zq',
    projectName: 'Mercedes CLE 53 AMG',
    ambassadorName: 'Alex',
    welcomeMessage: 'Bienvenue dans la Mercedes CLE 53 AMG. Je suis Alex, votre Ambassadeur IA. Comment puis-je vous aider ?',
    buttons: [
      { label: 'Réserver un essai',    url: 'https://mercedes.ca',      action: 'link' },
      { label: 'Demander un prix',     url: null,                        action: 'form' },
      { label: 'Parler à un conseiller', url: 'tel:+15140000000',        action: 'link' },
      { label: 'Itinéraire concession', url: 'https://maps.google.com', action: 'link' },
    ],
  },
  'mercedes-voiture-2': {
    matterportId: 'Fg8etsLyrWz',
    projectName: 'Mercedes Showroom',
    ambassadorName: 'Alex',
    welcomeMessage: 'Bienvenue dans le showroom Mercedes Québec. Je suis Alex, votre Ambassadeur IA.',
    buttons: [
      { label: 'Réserver un essai',    url: 'https://mercedes.ca',      action: 'link' },
      { label: 'Demander un prix',     url: null,                        action: 'form' },
      { label: 'Parler à un conseiller', url: 'tel:+15140000000',        action: 'link' },
      { label: 'Itinéraire concession', url: 'https://maps.google.com', action: 'link' },
    ],
  },
  'mercedes-voiture-3': {
    matterportId: 'gTHjEVgJEbZ',
    projectName: 'Mercedes Collection',
    ambassadorName: 'Alex',
    welcomeMessage: 'Bienvenue dans la collection Mercedes. Je suis Alex, votre Ambassadeur IA.',
    buttons: [
      { label: 'Réserver un essai',    url: 'https://mercedes.ca',      action: 'link' },
      { label: 'Demander un prix',     url: null,                        action: 'form' },
      { label: 'Parler à un conseiller', url: 'tel:+15140000000',        action: 'link' },
      { label: 'Itinéraire concession', url: 'https://maps.google.com', action: 'link' },
    ],
  },

  'test-ia-seule': {
  matterportId: '',
  projectName: 'Test IA Seule',
  ambassadorName: 'Luxedia',
  welcomeMessage: 'Bonjour ! Je suis Luxedia, comment puis-je vous aider ?',
  buttons: [
    { label: 'Nous contacter', url: 'tel:+18190000000', action: 'call' },
  ],
},
}