/**
 * Page Politique de cookies — Signature Immersion
 * Contenu de base enrichi : cookies de tiers (Matterport, etc.) + consentement.
 * À ajuster selon les outils réellement utilisés (analytics, etc.).
 * Route : /cookies
 */

'use client'

import LegalLayout from '@/components/site/LegalLayout'

export default function CookiesPage() {
  return (
    <LegalLayout
      eyebrow="Témoins de connexion"
      title="Politique de cookies"
      updatedLabel="Dernière mise à jour"
      updatedDate="21 juin 2026"
    >
      <p>
        Cette politique explique comment <strong>Signature Immersion</strong> utilise les cookies
        (aussi appelés « témoins de connexion ») sur son site.
      </p>

      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lorsque vous visitez un site. Il
        permet de faire fonctionner certaines fonctionnalités, de mémoriser vos préférences ou de
        mesurer l'audience.
      </p>

      <h2>2. Les cookies que nous utilisons</h2>

      <h3>Cookies techniques (nécessaires)</h3>
      <p>
        Indispensables au bon fonctionnement du site, par exemple pour mémoriser votre choix de
        langue (français ou anglais). Ils ne peuvent pas être désactivés.
      </p>

      <h3>Cookies de mesure d'audience</h3>
      <p>
        Nous pouvons utiliser des outils de mesure d'audience pour comprendre comment notre site est
        consulté (pages visitées, durée de visite) de façon agrégée et anonyme, afin d'améliorer
        l'expérience.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Préciser le ou les outils d'analytics réellement
        utilisés (ex. Google Analytics, Vercel Analytics, Plausible), ou retirer cette section si
        aucun n'est employé.
      </p>

      <h3>Cookies de préférences</h3>
      <p>
        Mémorisent certains choix pour vous offrir une expérience plus fluide lors de vos prochaines
        visites.
      </p>

      <h3>Cookies de tiers</h3>
      <p>
        Certaines fonctionnalités intégrées à notre site sont fournies par des services tiers. Ces
        services peuvent déposer leurs propres cookies, selon leurs politiques respectives, sur
        lesquelles nous n'avons pas de contrôle. C'est notamment le cas du lecteur immersif{' '}
        <strong>Matterport</strong> utilisé pour afficher les visites 3D.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Ajouter les autres services tiers éventuellement
        intégrés (ex. Google Maps, YouTube, outils de visite 360°).
      </p>

      <h2>3. Gérer les cookies</h2>
      <p>
        Vous pouvez à tout moment configurer votre navigateur pour bloquer ou supprimer les cookies.
        La désactivation de certains cookies peut toutefois affecter le fonctionnement de certaines
        parties du site.
      </p>
      <p>
        La plupart des navigateurs permettent de gérer les cookies depuis leurs paramètres
        (rubrique « Confidentialité » ou « Données de navigation »).
      </p>

      <h2>4. Consentement</h2>
      <p>
        Lorsque la loi l'exige, nous demanderons votre consentement avant l'utilisation de certains
        cookies non essentiels. Vous pourrez modifier vos préférences à tout moment.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des renseignements personnels est décrit dans notre{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question concernant cette politique :{' '}
        <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a> — Signature
        Immersion, Trois-Rivières, Québec.
      </p>

      <p className="legal-note">
        Ce document constitue une base et doit être ajusté selon les outils de suivi réellement
        utilisés sur le site. Une relecture est recommandée avant la mise en ligne publique.
      </p>
    </LegalLayout>
  )
}
