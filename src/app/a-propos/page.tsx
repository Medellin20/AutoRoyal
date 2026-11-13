import type { Metadata } from 'next'
import Image from 'next/image'
import { PublicShell } from '@/components/layout/public-shell'
import { Reveal } from '@/components/ui/motion'
import { ButtonLink } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'A propos',
  description: `${siteConfig.name} vend des véhicules accidentés avec une description de leur état et un parcours de commande en ligne.`,
  path: '/a-propos',
})

const sellingSteps = [
  { title: 'Un état décrit', text: 'Les fiches présentent le niveau de dommages et l’état de fonctionnement connus pour chaque véhicule.' },
  { title: 'Une commande claire', text: 'La sélection, les coordonnées client et le prix sont rassemblés sous une référence de commande.' },
  { title: 'Un paiement contrôlé', text: 'Le paiement n’est confirmé qu’après vérification effective par l’équipe.' },
]

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow">Le garage</p>
            <div className="rule-gold mt-3" />
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Spécialiste de la vente de véhicules accidentés
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              {siteConfig.name} propose des véhicules accidentés à la vente. Les informations de
              chaque annonce permettent de consulter les dommages déclarés et l&apos;état de fonctionnement.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              L&apos;application accompagne le client du catalogue à la création de commande, puis affiche
              le mode de paiement et un reçu. La validation du paiement est effectuée séparément par l’équipe.
            </p>
            <ButtonLink href="/vehicules" className="mt-8">
              Voir le parc disponible
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-lift">
              <Image
                src="/images/about.svg"
                alt="Atelier Laurent Crash Autos"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <div className="shell">
          <h2 className="font-display text-2xl font-semibold">Notre parcours de vente</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sellingSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <li className="border-t-2 border-accent pt-5">
                  <span className="font-display text-sm font-semibold text-accent">0{i + 1}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </PublicShell>
  )
}
