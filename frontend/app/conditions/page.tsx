/**
 * Page Conditions d'utilisation — Signature Immersion
 * Contenu de base enrichi : disponibilité des services, responsabilité des contenus
 * fournis par les clients, usage abusif de Luxedia, mineurs.
 * À FAIRE RELIRE par un juriste avant mise en ligne.
 * Route : /conditions
 */

'use client'

import LegalLayout from '@/components/site/LegalLayout'

export default function ConditionsPage() {
  return (
    <LegalLayout
      eyebrow="Cadre d'utilisation"
      title="Conditions d'utilisation"
      updatedLabel="Dernière mise à jour"
      updatedDate="21 juin 2026"
    >
      <p>
        Les présentes conditions encadrent l&apos;utilisation du site de{' '}
        <strong>Signature Immersion</strong> et des services qui y sont présentés. En accédant à ce
        site, vous acceptez les conditions décrites ci-dessous.
      </p>

      <h2>1. Objet du site</h2>
      <p>
        Ce site présente les services de Signature Immersion : expériences immersives 3D et 360°,
        intégration de contenus et assistant conversationnel Luxedia. Il permet également de nous
        contacter et de demander une démonstration.
      </p>

      <h2>2. Utilisation du site</h2>
      <p>Vous vous engagez à utiliser ce site de manière loyale et à ne pas :</p>
      <ul>
        <li>tenter d&apos;accéder à des zones non publiques ou sécurisées du site ;</li>
        <li>perturber le fonctionnement du site ou des services ;</li>
        <li>collecter des données d&apos;autres utilisateurs sans autorisation ;</li>
        <li>utiliser le contenu à des fins illégales ou non autorisées.</li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, visuels, logos, identité « Signature Immersion »,
        expériences immersives, assistant Luxedia) est protégé et demeure la propriété exclusive de
        Signature Immersion ou de ses partenaires. Toute reproduction ou réutilisation sans
        autorisation écrite préalable est interdite.
      </p>
      <p>
        Les marques, logos et contenus de tiers (par exemple les espaces de nos clients présentés
        en réalisation) demeurent la propriété de leurs détenteurs respectifs.
      </p>

      <h2>4. Contenus fournis par les clients</h2>
      <p>
        Les informations intégrées dans les expériences immersives (fiches, descriptions, prix,
        menus, documents, visuels, etc.) peuvent être fournies par les clients de Signature
        Immersion. Ces clients demeurent <strong>seuls responsables</strong> de l&apos;exactitude, de la
        mise à jour et de la légalité des contenus qu&apos;ils nous transmettent.
      </p>
      <p>
        Signature Immersion ne saurait être tenue responsable d&apos;une information inexacte, périmée ou
        non conforme transmise par un client et intégrée à une expérience.
      </p>

      <h2>5. Expériences immersives et liens partagés</h2>
      <p>
        Les expériences immersives livrées (accessibles par lien ou code QR) sont destinées à un
        usage en lien avec le projet concerné. Signature Immersion peut faire évoluer, suspendre ou
        retirer une expérience pour des raisons techniques ou contractuelles.
      </p>

      <h2>6. Assistant Luxedia</h2>
      <p>
        L&apos;assistant Luxedia fournit des réponses générées automatiquement à titre informatif. Bien
        que nous veillions à leur pertinence, ces réponses ne constituent pas un engagement
        contractuel. En cas de doute, nous vous invitons à nous contacter directement.
      </p>
      <p>
        L&apos;utilisateur s&apos;engage à ne pas utiliser Luxedia à des fins illégales, frauduleuses,
        diffamatoires, abusives ou contraires aux lois applicables.
      </p>

      <h2>7. Disponibilité des services</h2>
      <p>
        Nous nous efforçons d&apos;assurer la disponibilité du site et des services. Nous nous réservons
        toutefois le droit de modifier, suspendre ou interrompre tout ou partie du site ou des
        services, sans préavis, lorsque des contraintes techniques, de sécurité ou contractuelles
        l&apos;exigent.
      </p>

      <h2>8. Limitation de responsabilité</h2>
      <p>
        Signature Immersion s&apos;efforce d&apos;assurer l&apos;exactitude des informations présentées et le bon
        fonctionnement du site, sans pouvoir le garantir de façon absolue. Notre responsabilité ne
        saurait être engagée en cas d&apos;interruption du service, d&apos;erreur, ou de dommage indirect lié
        à l&apos;utilisation du site.
      </p>

      <h2>9. Liens externes</h2>
      <p>
        Ce site peut contenir des liens vers des sites tiers. Signature Immersion n&apos;exerce aucun
        contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>10. Mineurs</h2>
      <p>
        Ce site n&apos;est pas destiné aux personnes de moins de 14 ans sans l&apos;autorisation d&apos;un parent
        ou d&apos;un tuteur. Si vous êtes mineur, vous ne devez nous transmettre aucun renseignement
        personnel sans cette autorisation.
      </p>

      <h2>11. Droit applicable</h2>
      <p>
        Les présentes conditions sont régies par les lois applicables au Québec et au Canada. Tout
        différend sera soumis aux tribunaux compétents de la province de Québec.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Confirmer le district judiciaire / ville de
        juridiction (ex. district de Trois-Rivières).
      </p>

      <h2>12. Contact</h2>
      <p>
        Pour toute question concernant ces conditions :{' '}
        <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a> — Signature
        Immersion, Trois-Rivières, Québec.
      </p>

      <p className="legal-note">
        Ce document constitue une base et ne remplace pas un avis juridique. Une relecture par une
        personne qualifiée est recommandée avant la mise en ligne publique.
      </p>
    </LegalLayout>
  )
}
