import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/motion'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#080a0d] text-white">
      <Image
        src="/images/laurent-crash-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden
        className="-z-20 object-cover object-[72%_center] sm:object-[65%_center]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/45 to-transparent max-lg:from-black/90 max-lg:via-black/65 max-lg:to-black/35" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-black/25 to-transparent" />

      <div className="shell relative flex min-h-[620px] items-center py-14 sm:min-h-[660px] lg:min-h-[700px] lg:py-20">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff555b]">Véhicules accidentés · France et Europe</p>
            <div className="rule-gold mt-4" />
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              Trouvez votre prochain véhicule,
              <span className="block text-[#ff343b]">même accidenté.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
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
              <ButtonLink href="/contact" variant="ghost" size="lg" className="border border-white/35 text-white hover:bg-white/10 hover:text-white">
                Nous contacter
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/20 pt-6 sm:gap-6">
              <div>
                <dt className="text-lg font-semibold text-white sm:text-xl">Dommages</dt>
                <dd className="mt-1 text-xs text-white/65">décrits sur chaque fiche</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-white sm:text-xl">Prix fixes</dt>
                <dd className="mt-1 text-xs text-white/65">affichés au catalogue</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-lg font-semibold text-white sm:text-xl">
                  Paiement <ShieldCheck className="h-4 w-4 text-[#ff555b]" />
                </dt>
                <dd className="mt-1 text-xs text-white/65">vérifié par notre équipe</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
