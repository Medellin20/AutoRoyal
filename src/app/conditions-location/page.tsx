import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/legal-page'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = buildMetadata({
  title: 'Conditions generales de location',
  description: 'Conditions applicables a toute location de vehicule : conducteur, caution, assurance, carburant, restitution.',
  path: '/conditions-location',
})

export default function Page() {
  return (
    <LegalPage
      eyebrow="Contrat"
      title="Conditions generales de location"
      updatedAt="1er janvier 2026"
      sections={[
        {
          title: '1. Conducteur autorise',
          body: [
            "Le locataire doit etre age d au moins 23 ans et detenir un permis de conduire valide depuis plus de deux ans. Tout conducteur additionnel doit etre declare au contrat et remplir les memes conditions.",
            "Conduire le vehicule sans avoir ete declare au contrat annule les garanties souscrites.",
          ],
        },
        {
          title: '2. Duree et restitution',
          body: [
            "La location court de la date et heure de depart indiquees au contrat jusqu a la restitution du vehicule au lieu convenu en France metropolitaine.",
            "Tout retard superieur a une heure entraine la facturation d une journee supplementaire au tarif journalier en vigueur.",
          ],
        },
        {
          title: '3. Caution',
          body: [
            "Une caution est demandee au depart. Elle est restituee dans un delai de 72 heures apres la restitution, deduction faite des dommages constates a l etat des lieux contradictoire, des amendes et du carburant manquant.",
          ],
        },
        {
          title: '4. Carburant et kilometrage',
          body: [
            "Le vehicule est remis avec un plein. Il doit etre restitue dans le meme etat, faute de quoi le carburant manquant est facture avec des frais de service.",
            "Le forfait journalier inclut 200 kilometres. Chaque kilometre supplementaire est facture selon le tarif affiche au contrat.",
          ],
        },
        {
          title: '5. Assurance et sinistres',
          body: [
            "Le vehicule est assure au tiers avec option tous risques selon la formule choisie. Une franchise reste a la charge du locataire en cas de sinistre responsable.",
            "Tout sinistre doit etre declare a l agence dans les 24 heures, accompagne du constat amiable.",
          ],
        },
        {
          title: '6. Interdictions',
          body: [
            "Sont interdits : la sous-location, le transport de marchandises dangereuses, la participation a des competitions et la conduite hors des routes carrossables. Tout trajet hors de France doit etre autorise par ecrit au prealable.",
          ],
        },
        {
          title: '7. Panne et assistance',
          body: [
            `En cas d immobilisation, contactez Laurent Crash Autos au ${siteConfig.contact.phone || siteConfig.contact.email} pour connaitre les modalites d assistance.`,
          ],
        },
        {
          title: '8. Annulation',
          body: [
            "Une annulation notifiee plus de 48 heures avant le depart est sans frais. En deca, une indemnite correspondant a une journee de location est retenue.",
          ],
        },
      ]}
    />
  )
}
