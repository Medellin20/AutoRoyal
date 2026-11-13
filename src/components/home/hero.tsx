import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/motion'

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
            <p className="eyebrow">Véhicules accidentés · France et Europe</p>
            <div className="rule-gold mt-4" />
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Trouvez votre prochain véhicule,
              <span className="block text-accent">même accidenté.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Consultez les dommages déclarés, l&apos;état de fonctionnement et le prix de chaque véhicule.
              Commandez en ligne puis payez par virement ou lien sécurisé.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/vehicules" size="lg">
                Voir le catalogue
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
                <dt className="text-2xl font-semibold text-ink">État</dt>
                <dd className="mt-1 text-xs text-muted">des dommages indiqué</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-2xl font-semibold text-ink">
                  Paiement
                </dt>
                <dd className="mt-1 text-xs text-muted">vérifié manuellement</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-2xl font-semibold text-ink">
                  PDF <ShieldCheck className="h-4 w-4 text-accent" />
                </dt>
                <dd className="mt-1 text-xs text-muted">reçu de commande</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={24}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-card bg-surface shadow-lift lg:aspect-[4/3]">
            <Image
              src="/images/hero.svg"
              alt="Catalogue Laurent Crash Autos de véhicules accidentés"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Laurent Crash Autos</p>
              <p className="mt-1 font-display text-base font-semibold">
                Véhicules accidentés à vendre en France et en Europe
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
