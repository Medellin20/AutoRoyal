import type { Metadata } from 'next'
import Image from 'next/image'
import { PublicShell } from '@/components/layout/public-shell'
import { Reveal } from '@/components/ui/motion'
import { ButtonLink } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'A propos',
  description: `L histoire de ${siteConfig.name}, notre atelier et notre facon de travailler.`,
  path: '/a-propos',
})

const milestones = [
  { year: '2016', title: 'Un atelier, deux mecaniciens', text: "Nous reparions les vehicules des autres. C'est la que nous avons appris à reconnaitre une bonne occasion d'une mauvaise." },
  { year: '2019', title: 'Premiere flotte de location', text: "Six vehicules, entretenus dans notre propre atelier. Le principe n a pas change depuis." },
  { year: '2022', title: 'Ouverture du parc de vente', text: "Chaque vehicule passe le controle 42 points avant d'etre expose. Ce qui ne passe pas ne se vend pas." },
  { year: '2025', title: 'Livraison en France', text: "Les modalites de livraison sont convenues avec le client et precisees au devis." },
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
              Un atelier d&apos;abord, un concessionnaire ensuite
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              {siteConfig.name} a commence par reparer des voitures. Cette habitude nous est restee :
              nous ouvrons le capot avant de fixer un prix, et nous refusons les vehicules dont
              l&apos;historique ne tient pas debout.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Aujourd&apos;hui, le même atelier entretient la flotte de location et prepare les
              vehicules mis en vente. C&apos;est ce qui nous permet de tenir la garantie 6 mois sans
              discuter.
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
          <h2 className="font-display text-2xl font-semibold">Les étapes qui comptent</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.06}>
                <li className="border-t-2 border-accent pt-5">
                  <span className="font-display text-sm font-semibold text-accent">{m.year}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </PublicShell>
  )
}
