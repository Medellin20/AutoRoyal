import type { Metadata } from 'next'
import { CalendarRange, CarFront, FileSignature, Truck, Users, Wrench } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { Stagger, StaggerItem } from '@/components/ui/motion'
import { ButtonLink } from '@/components/ui/button'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description: 'Location courte et longue duree, vente de vehicules revises, livraison, mise a disposition avec chauffeur.',
  path: '/services',
})

const services = [
  { icon: CalendarRange, title: 'Location courte duree', text: "A la journee ou au week-end, assurance et 200 km par jour inclus. Ideal pour un deplacement ponctuel." },
  { icon: CarFront, title: 'Location longue duree', text: "A partir d un mois, entretien et revisions pris en charge. Facturation mensuelle detaillee." },
  { icon: FileSignature, title: 'Vente de vehicules revises', text: "Controle 42 points, garantie 6 mois moteur et boite, papiers remis le jour de la livraison." },
  { icon: Users, title: 'Mise a disposition avec chauffeur', text: "Chauffeur experimente pour vos deplacements professionnels ou vos evenements." },
  { icon: Truck, title: 'Livraison et reprise', text: "Livraison en France metropolitaine. Pour une destination europeenne, contactez-nous afin d obtenir un devis." },
  { icon: Wrench, title: 'Entretien et depannage', text: "Atelier integre. En location, vehicule de remplacement sous 4 h en cas d immobilisation." },
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
            Six prestations, toutes assurees en interne par la meme equipe.
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
            <h2 className="font-display text-xl font-semibold">Un besoin sur mesure ?</h2>
            <p className="mt-1.5 text-sm text-muted">
              Flotte d entreprise, mission longue, evenement : nous construisons le devis avec vous.
            </p>
          </div>
          <ButtonLink href="/contact">Demander un devis</ButtonLink>
        </div>
      </section>
    </PublicShell>
  )
}
