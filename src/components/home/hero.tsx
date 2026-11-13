import Image from 'next/image'
import { ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/motion'
import { siteConfig } from '@/config/site'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 lg:pt-16">
      {/* Halo lumineux discret, coherent avec la palette claire */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-accent-soft blur-3xl"
      />

      <div className="shell relative grid items-center gap-12 pb-16 lg:grid-cols-[1fr_1.1fr] lg:pb-24">
        <div>
          <Reveal>
            <p className="eyebrow">Vente et location en France</p>
            <div className="rule-gold mt-4" />
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              La voiture qu&apos;il vous faut,
              <span className="block text-accent">prete a partir.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Chaque vehicule passe un controle en 42 points avant d&apos;etre mis en ligne. Tarifs
              affiches, contrat clair, livraison possible a domicile.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/vehicules" size="lg">
                Voir les vehicules
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Nous contacter
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-2xl font-semibold text-ink">120+</dt>
                <dd className="mt-1 text-xs text-muted">vehicules livres</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-2xl font-semibold text-ink">
                  4,8 <Star className="h-4 w-4 fill-gold text-gold" />
                </dt>
                <dd className="mt-1 text-xs text-muted">note clients</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-2xl font-semibold text-ink">
                  42 <ShieldCheck className="h-4 w-4 text-accent" />
                </dt>
                <dd className="mt-1 text-xs text-muted">points controles</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={24}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-card bg-surface shadow-lift lg:aspect-[4/3]">
            <Image
              src="/images/hero.svg"
              alt="Vehicule prepare dans l atelier Laurent Crash Autos"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Disponible aujourd&apos;hui</p>
              <p className="mt-1 font-display text-base font-semibold">
                Livraison en France metropolitaine, selon le devis
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
