import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/legal-page'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = buildMetadata({
  title: 'Politique de confidentialite',
  description: 'Donnees collectees, finalites, duree de conservation et exercice de vos droits.',
  path: '/politique-confidentialite',
})

export default function Page() {
  return (
    <LegalPage
      eyebrow="Vos donnees"
      title="Politique de confidentialite"
      updatedAt="1er janvier 2026"
      sections={[
        {
          title: 'Donnees collectees',
          body: [
            "Nous collectons uniquement les informations que vous saisissez dans nos formulaires : nom, telephone, adresse e-mail, adresse postale et contenu de vos messages.",
            "Le site ne collecte pas les identifiants bancaires du client ni les données de carte. Le RIB professionnel ou le lien de paiement configuré pour les commandes est conservé dans l’espace d’administration.",
          ],
        },
        {
          title: 'Finalites',
          body: [
            "Ces informations servent à créer et suivre les commandes de véhicules, à enregistrer les paiements vérifiés, à envoyer une alerte de commande à l’administration et à répondre aux messages.",
            "Elles ne sont ni vendues ni cedees a des tiers a des fins commerciales.",
          ],
        },
        {
          title: 'Duree de conservation',
          body: [
            "Les demandes sans suite sont conservees douze mois. Les dossiers contractualises sont conserves pendant la duree legale applicable aux documents commerciaux.",
          ],
        },
        {
          title: 'Vos droits',
          body: [
            `Vous pouvez demander l acces, la rectification ou la suppression de vos donnees en ecrivant a ${siteConfig.contact.email}. Nous repondons sous trente jours.`,
          ],
        },
        {
          title: 'Cookies',
          body: [
            "Le site utilise uniquement des cookies techniques necessaires a la session administrateur. Aucun cookie publicitaire ni traceur tiers n est depose.",
          ],
        },
        {
          title: 'Securite',
          body: [
            "Les mots de passe sont stockes sous forme hachee. Les acces administrateurs sont limites par role et les actions sensibles sont journalisees.",
          ],
        },
      ]}
    />
  )
}
