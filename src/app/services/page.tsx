import type { Metadata } from 'next'
import { CarFront, FileSignature, ShieldCheck, Banknote } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { Stagger, StaggerItem } from '@/components/ui/motion'
import { ButtonLink } from '@/components/ui/button'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description: 'Catalogue et commande de véhicules accidentés à vendre en France et en Europe.',
  path: '/services',
})

const services = [
  { icon: CarFront, title: 'Catalogue de véhicules accidentés', text: 'Parcourez les véhicules proposés à la vente et consultez leur prix, les dommages déclarés et leur état de fonctionnement.' },
  { icon: FileSignature, title: 'Commande en ligne', text: 'Sélectionnez un véhicule et transmettez vos coordonnées pour créer une commande suivie dans l’espace administration.' },
  { icon: Banknote, title: 'Paiement configuré', text: 'Après la commande, retrouvez le RIB ou le lien de paiement choisi par Laurent Crash Autos.' },
  { icon: ShieldCheck, title: 'Vérification manuelle', text: 'Le paiement demeure en attente jusqu’à la confirmation réelle par l’équipe. Le reçu PDF ne change pas ce statut.' },
]

export default function ServicesPage() {
  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Services</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Ce que nous faisons</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Les étapes du catalogue à la vérification du paiement.
          </p>
        </div>
      </section>

      <section className="shell py-14">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.title}>
              <article className="h-full rounded-card border border-line bg-white p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <service.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.text}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-card border border-line bg-surface p-8">
          <div>
            <h2 className="font-display text-xl font-semibold">Vous avez trouvé un véhicule ?</h2>
            <p className="mt-1.5 text-sm text-muted">
              Sélectionnez-le dans le catalogue pour poursuivre vers le formulaire client et la commande.
            </p>
          </div>
          <ButtonLink href="/vehicules">Parcourir le catalogue</ButtonLink>
        </div>
      </section>
    </PublicShell>
  )
}
