import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/legal-page'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = buildMetadata({
  title: 'Mentions legales',
  description: 'Editeur du site, hebergeur, propriete intellectuelle et responsabilite.',
  path: '/mentions-legales',
})

export default function Page() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions legales"
      updatedAt="1er janvier 2026"
      sections={[
        {
          title: 'Editeur du site',
          body: [
            `${siteConfig.legalName}, societe specialisee dans la location et la vente de vehicules.`,
            `Siege : ${siteConfig.contact.address}. Telephone : ${siteConfig.contact.phone}. E-mail : ${siteConfig.contact.email}.`,
            'Numero d immatriculation et identifiant fiscal a completer avant mise en production.',
          ],
        },
        {
          title: 'Directeur de la publication',
          body: ['Le representant legal de la societe editrice.'],
        },
        {
          title: 'Hebergement',
          body: [
            "Le site est heberge sur une infrastructure cloud. Les coordonnees completes de l hebergeur sont fournies sur simple demande.",
          ],
        },
        {
          title: 'Propriete intellectuelle',
          body: [
            "Les textes, photographies et elements graphiques presents sur ce site sont la propriete de l editeur ou utilises avec autorisation. Toute reproduction sans accord ecrit est interdite.",
          ],
        },
        {
          title: 'Responsabilite',
          body: [
            "Les informations techniques des vehicules sont fournies a titre indicatif et verifiees a chaque mise a jour. Seul l etat des lieux signe en agence fait foi.",
          ],
        },
      ]}
    />
  )
}
