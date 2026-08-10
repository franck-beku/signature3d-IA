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
      title="Politique relative aux cookies et technologies similaires"
      updatedLabel="Dernière mise à jour"
      updatedDate="10 août 2026"
    >
      <p>
        La présente politique explique comment <strong>Signature Immersion</strong> utilise les
        cookies (également appelés « témoins »), le stockage local et certaines technologies
        similaires lorsque vous utilisez notre site Web et nos expériences immersives.
      </p>
      <p>
        Elle doit être lue conjointement avec notre{' '}
        <a href="/confidentialite">Politique de confidentialité</a>, qui explique plus largement
        comment nous traitons les renseignements personnels.
      </p>

      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier ou ensemble de données qu&apos;un site Web peut enregistrer
        sur votre appareil lorsque vous le consultez.
      </p>
      <p>Les cookies peuvent notamment servir à :</p>
      <ul>
        <li>assurer le fonctionnement d&apos;un site ;</li>
        <li>maintenir une session ;</li>
        <li>mémoriser certaines préférences ;</li>
        <li>mesurer l&apos;utilisation d&apos;un service ;</li>
        <li>personnaliser une expérience.</li>
      </ul>
      <p>
        D&apos;autres technologies, comme le stockage local du navigateur (<code>localStorage</code>),
        peuvent remplir certaines fonctions similaires sans utiliser de cookie.
      </p>

      <h2>2. Technologies utilisées par Signature Immersion</h2>

      <h3>Stockage de la préférence linguistique</h3>
      <p>
        Signature Immersion utilise le stockage local du navigateur (<code>localStorage</code>)
        afin de mémoriser votre préférence linguistique entre le français et l&apos;anglais.
      </p>
      <p>
        Cette information est enregistrée directement dans votre navigateur afin que le site
        puisse conserver votre choix lors de vos prochaines consultations.
      </p>
      <p>Cette préférence n&apos;est pas utilisée à des fins publicitaires ou de profilage.</p>
      <p>
        Vous pouvez supprimer cette information en effaçant les données enregistrées par le site
        dans les paramètres de votre navigateur.
      </p>

      <h3>Aucun cookie publicitaire ou analytique propriétaire</h3>
      <p>
        À la date de la dernière mise à jour de cette politique, Signature Immersion ne dépose
        pas de cookies propriétaires à des fins publicitaires, de profilage ou de mesure
        d&apos;audience sur son site public.
      </p>
      <p>
        Nous n&apos;utilisons actuellement pas de service d&apos;analyse Web tel que Google Analytics,
        Meta Pixel ou autre outil publicitaire comparable sur le site public.
      </p>
      <p>
        Certaines statistiques relatives aux expériences immersives peuvent néanmoins être
        recueillies directement par nos systèmes, notamment le nombre de consultations, la durée
        de certaines visites ou certaines interactions.
      </p>
      <p>
        Ces mécanismes ne reposent actuellement pas sur le dépôt d&apos;un cookie permettant de
        suivre un visiteur entre différentes visites.
      </p>
      <p>
        Pour plus d&apos;information concernant les données recueillies dans le cadre de ces
        statistiques, veuillez consulter notre{' '}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>3. Expériences et services de tiers</h2>
      <p>
        Certaines expériences immersives peuvent intégrer des contenus ou visionneuses exploités
        par des fournisseurs tiers.
      </p>
      <p>Selon le projet consulté, il peut notamment s&apos;agir de technologies telles que :</p>
      <ul>
        <li>Matterport ;</li>
        <li>Glo3D ;</li>
        <li>Kuula ;</li>
        <li>Pano2VR ;</li>
        <li>
          ou d&apos;autres solutions de visualisation 3D ou 360° utilisées pour une expérience
          particulière.
        </li>
      </ul>
      <p>
        Lorsque ces contenus tiers sont chargés, les fournisseurs concernés peuvent utiliser
        leurs propres cookies ou technologies similaires.
      </p>
      <p>
        Ces technologies sont exploitées par les fournisseurs concernés et peuvent être soumises
        à leurs propres politiques de confidentialité et de cookies.
      </p>
      <p>
        Nous vous invitons à consulter les politiques des fournisseurs concernés lorsque vous
        utilisez leurs services intégrés à une expérience Signature Immersion.
      </p>

      <h2>4. Authentification du dashboard</h2>
      <p>
        L&apos;espace d&apos;administration de Signature Immersion utilise également le stockage local
        du navigateur afin de conserver temporairement un jeton d&apos;authentification nécessaire à
        la session d&apos;un utilisateur autorisé.
      </p>
      <p>
        Cette fonctionnalité concerne uniquement les personnes autorisées à accéder au dashboard
        de Signature Immersion et n&apos;est pas utilisée pour suivre les visiteurs du site public.
      </p>

      <h2>5. Gestion des cookies et du stockage local</h2>
      <p>
        Vous pouvez configurer votre navigateur afin de bloquer ou supprimer les cookies ainsi
        que certaines données enregistrées localement.
      </p>
      <p>
        Selon votre navigateur, ces options se trouvent généralement dans les paramètres relatifs
        à la confidentialité, aux cookies, aux données des sites ou aux données de navigation.
      </p>
      <p>
        La suppression de certaines données techniques peut entraîner la réinitialisation de vos
        préférences, notamment votre choix de langue.
      </p>
      <p>
        Les cookies éventuellement déposés par une visionneuse ou un service tiers intégré
        peuvent également être soumis aux mécanismes de gestion proposés par votre navigateur ou
        par le fournisseur concerné.
      </p>

      <h2>6. Consentement</h2>
      <p>
        Signature Immersion n&apos;utilise actuellement pas, sur son site public, de cookies
        propriétaires à des fins publicitaires ou de profilage nécessitant la mise en place d&apos;un
        mécanisme de consentement pour ces finalités.
      </p>
      <p>
        Si nous ajoutons ultérieurement des technologies non essentielles nécessitant un
        consentement préalable, nous adapterons nos mécanismes de consentement ainsi que la
        présente politique avant ou au moment de leur mise en œuvre.
      </p>
      <p>
        Lorsque la loi exige un consentement, les technologies concernées ne seront utilisées
        qu&apos;après l&apos;obtention de ce consentement conformément aux exigences applicables.
      </p>

      <h2>7. Évolution de nos technologies</h2>
      <p>
        Les technologies utilisées par Signature Immersion peuvent évoluer avec le développement
        de nos services.
      </p>
      <p>
        Nous pouvons notamment ajouter, remplacer ou retirer certains outils techniques ou
        fournisseurs.
      </p>
      <p>
        Lorsque ces changements ont une incidence sur l&apos;utilisation de cookies ou de
        technologies similaires, la présente politique sera mise à jour en conséquence et,
        lorsque requis, les mécanismes de consentement appropriés seront mis en place.
      </p>
      <p>La date de la dernière mise à jour est indiquée au début de cette page.</p>

      <h2>8. Protection des renseignements personnels</h2>
      <p>
        Lorsque l&apos;utilisation d&apos;un cookie, du stockage local ou d&apos;une technologie similaire
        entraîne le traitement de renseignements personnels, ce traitement est effectué
        conformément à notre <a href="/confidentialite">Politique de confidentialité</a>.
      </p>
      <p>
        Cette politique explique notamment les catégories de renseignements que nous recueillons,
        les raisons pour lesquelles nous les utilisons, les fournisseurs avec lesquels certaines
        informations peuvent être communiquées ainsi que les droits dont disposent les personnes
        concernées.
      </p>

      <h2>9. Contact</h2>
      <p>
        Pour toute question concernant l&apos;utilisation des cookies ou des technologies similaires
        par Signature Immersion :
      </p>
      <p>
        Signature Immersion
        <br />
        Trois-Rivières, Québec
        <br />
        Courriel :{' '}
        <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a>
      </p>
    </LegalLayout>
  )
}
