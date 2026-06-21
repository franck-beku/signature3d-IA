/**
 * Page Politique de confidentialité — Signature Immersion
 * Contenu de base (Loi 25 Québec) enrichi : hébergement/transfert hors Québec,
 * fournisseurs/sous-traitants, incidents de confidentialité.
 * À FAIRE RELIRE par un juriste avant mise en ligne.
 * Route : /confidentialite
 */

'use client'

import LegalLayout from '@/components/site/LegalLayout'

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      eyebrow="Vie privée"
      title="Politique de confidentialité"
      updatedLabel="Dernière mise à jour"
      updatedDate="21 juin 2026"
    >
      <p>
        La présente politique explique comment <strong>Signature Immersion</strong> recueille,
        utilise et protège vos renseignements personnels lorsque vous utilisez notre site et nos
        services. Nous nous engageons à respecter la <strong>Loi 25</strong> (Loi modernisant des
        dispositions législatives en matière de protection des renseignements personnels) en
        vigueur au Québec.
      </p>

      <h2>1. Responsable des renseignements personnels</h2>
      <p>
        Signature Immersion, situé à Trois-Rivières (Québec), est responsable des renseignements
        personnels collectés via ce site. Pour toute question relative à cette politique, vous
        pouvez contacter notre responsable de la protection des renseignements personnels à
        l'adresse <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a>.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Nom de la personne responsable de la protection
        des renseignements personnels (exigé par la Loi 25).
      </p>

      <h2>2. Renseignements que nous recueillons</h2>
      <p>
        Lorsque vous remplissez un formulaire de contact ou demandez une démonstration, nous
        pouvons recueillir les renseignements suivants :
      </p>
      <ul>
        <li>votre nom complet ;</li>
        <li>votre adresse courriel ;</li>
        <li>votre numéro de téléphone ;</li>
        <li>le secteur d'activité concerné ;</li>
        <li>le contenu du message que vous nous transmettez.</li>
      </ul>
      <p>
        Nous pouvons également recueillir des données techniques anonymes liées à la navigation
        (voir notre <a href="/cookies">politique de cookies</a>).
      </p>

      <h2>3. Finalités de la collecte</h2>
      <p>Vos renseignements sont utilisés uniquement pour :</p>
      <ul>
        <li>répondre à vos demandes et vous recontacter ;</li>
        <li>préparer une proposition adaptée à votre projet ;</li>
        <li>assurer le suivi de la relation commerciale ;</li>
        <li>améliorer nos services et l'expérience proposée.</li>
      </ul>
      <p>
        Nous ne vendons, ne louons et n'échangeons jamais vos renseignements personnels avec des
        tiers à des fins commerciales.
      </p>

      <h2>4. Hébergement et localisation des données</h2>
      <p>
        Notre site et nos services s'appuient sur des fournisseurs d'infrastructure infonuagique. À ce
        titre, vos renseignements peuvent être hébergés ou traités sur des serveurs situés{' '}
        <strong>à l'extérieur du Québec et du Canada</strong>, notamment aux États-Unis.
      </p>
      <p>
        Nous recourons en particulier à des plateformes d'hébergement et de base de données telles
        que <strong>Vercel</strong> (site), <strong>Railway</strong> (services applicatifs) et{' '}
        <strong>Supabase</strong> (base de données). Lorsque des renseignements sont communiqués à
        l'extérieur du Québec, nous veillons à ce qu'ils bénéficient d'une protection adéquate,
        conformément à la Loi 25.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Confirmer la liste exacte des hébergeurs et la
        région d'hébergement de chacun.
      </p>

      <h2>5. Communication à des fournisseurs</h2>
      <p>
        Pour fournir nos services, nous faisons appel à des prestataires techniques qui peuvent
        traiter certains renseignements en notre nom, uniquement dans la mesure nécessaire à leur
        prestation :
      </p>
      <ul>
        <li><strong>Service d'envoi de courriels</strong> (Resend) — pour vous notifier et traiter les demandes de contact ;</li>
        <li><strong>Hébergement et base de données</strong> (Vercel, Railway, Supabase) ;</li>
        <li><strong>Génération de codes QR</strong> — pour produire les liens d'accès aux expériences ;</li>
        <li><strong>Assistant conversationnel</strong> (Luxedia, propulsé par un fournisseur d'intelligence artificielle) — pour répondre aux questions des visiteurs.</li>
      </ul>
      <p>
        Ces fournisseurs sont tenus de protéger les renseignements et de ne les utiliser que pour
        les finalités prévues.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Confirmer la liste exacte des fournisseurs et,
        le cas échéant, le fournisseur d'IA utilisé par Luxedia.
      </p>

      <h2>6. Consentement</h2>
      <p>
        En soumettant un formulaire sur notre site, vous consentez à la collecte et à l'utilisation
        de vos renseignements selon les finalités décrites ci-dessus. Vous pouvez retirer votre
        consentement à tout moment en nous écrivant.
      </p>

      <h2>7. Conservation des renseignements</h2>
      <p>
        Vos renseignements sont conservés aussi longtemps que nécessaire pour atteindre les
        finalités décrites, ou tant que la relation commerciale est active, après quoi ils sont
        détruits de manière sécuritaire.
      </p>
      <p>
        <span className="todo">[À COMPLÉTER]</span> Durée de conservation précise des leads (ex. 24
        mois après le dernier contact), à confirmer.
      </p>

      <h2>8. Vos droits</h2>
      <p>Conformément à la Loi 25, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès</strong> : connaître les renseignements que nous détenons sur vous ;</li>
        <li><strong>Rectification</strong> : corriger un renseignement inexact ou incomplet ;</li>
        <li><strong>Retrait</strong> : retirer votre consentement et demander la suppression de vos données ;</li>
        <li><strong>Portabilité</strong> : recevoir vos renseignements dans un format structuré.</li>
      </ul>
      <p>
        Pour exercer l'un de ces droits, écrivez-nous à{' '}
        <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a>. Nous répondrons
        dans les délais prévus par la loi.
      </p>

      <h2>9. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour
        protéger vos renseignements contre la perte, l'accès non autorisé ou la divulgation. Les
        données sont hébergées sur des serveurs sécurisés et l'accès est restreint aux personnes
        autorisées.
      </p>

      <h2>10. Incidents de confidentialité</h2>
      <p>
        En cas d'incident de confidentialité (perte, accès non autorisé, divulgation ou utilisation
        non permise de renseignements personnels), nous prenons les mesures raisonnables pour en
        diminuer les conséquences et éviter qu'un nouvel incident de même nature ne survienne.
      </p>
      <p>
        Lorsqu'un incident présente un <strong>risque de préjudice sérieux</strong>, nous avisons la
        Commission d'accès à l'information (CAI) ainsi que les personnes concernées, et nous tenons
        un registre des incidents, conformément à la Loi 25.
      </p>

      <h2>11. Modifications de cette politique</h2>
      <p>
        Nous pouvons mettre à jour la présente politique. La date de dernière mise à jour est
        indiquée en haut de cette page. Nous vous invitons à la consulter régulièrement.
      </p>

      <h2>12. Nous contacter</h2>
      <p>
        Pour toute question concernant cette politique ou le traitement de vos renseignements
        personnels :{' '}
        <a href="mailto:info@signatureimmersion.ca">info@signatureimmersion.ca</a> — Signature
        Immersion, Trois-Rivières, Québec.
      </p>

      <p className="legal-note">
        Ce document constitue une base et ne remplace pas un avis juridique. Signature Immersion
        recommande une relecture par une personne qualifiée en conformité à la Loi 25 avant la mise
        en ligne publique.
      </p>
    </LegalLayout>
  )
}
