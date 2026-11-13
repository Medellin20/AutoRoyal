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
            `${siteConfig.legalName}, éditeur de ce site consacré à la vente de véhicules accidentés.`,
            `Adresse du siege social : a renseigner. Zone desservie : ${siteConfig.contact.address}. Telephone : ${siteConfig.contact.phone || 'a renseigner'}. E-mail : ${siteConfig.contact.email}.`,
            'Forme juridique, numero d immatriculation, identifiant fiscal, directeur de publication et coordonnees de l hebergeur a completer avant mise en production.',
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
            "Les informations visibles sur les fiches décrivent les dommages et l’état déclarés pour les véhicules proposés à la vente. Les modalités définitives sont confirmées avec le vendeur.",
          ],
        },
      ]}
    />
  )
}
