import Image from 'next/image'
import Link from 'next/link'
import {
  BadgeCheck, Banknote, CarFront, FileCheck2, Headphones,
  KeyRound, MapPin, ShieldCheck, Wrench,
} from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion'
import { ButtonLink } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <div className={`rule-gold mt-3 ${align === 'center' ? 'mx-auto' : ''}`} />
      <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
    </Reveal>
  )
}

/** Deux étapes d'accès au catalogue et à la commande. */
export function OfferSplit() {
  const offers = [
    {
      title: 'Voir le catalogue',
      href: '/vehicules',
      image: '/images/offer-sale.svg',
      text: 'Comparez le prix, les dommages déclarés et l’état de fonctionnement de chaque véhicule.',
      cta: 'Parcourir les véhicules accidentés',
      icon: KeyRound,
    },
    {
      title: 'Commander en ligne',
      href: '/demande-achat',
      image: '/images/hero.svg',
      text: 'Renseignez vos coordonnées, recevez les instructions de paiement et téléchargez votre reçu PDF.',
      cta: 'Créer une commande',
      icon: FileCheck2,
    },
  ]

  return (
    <section className="shell py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {offers.map((offer, i) => (
          <Reveal key={offer.title} delay={i * 0.08}>
            <Link
              href={offer.href}
              className="group relative block overflow-hidden rounded-card border border-line bg-white shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <offer.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold">{offer.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{offer.text}</p>
                <p className="mt-4 text-sm font-medium text-accent">{offer.cta} &rarr;</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function Advantages() {
  const items = [
    { icon: ShieldCheck, title: 'Dommages déclarés', text: 'Chaque fiche indique le niveau, les zones endommagées et l’état de fonctionnement renseignés.' },
    { icon: Banknote, title: 'Prix affiché', text: 'Le montant de la commande reprend le prix de vente présenté sur la fiche du véhicule.' },
    { icon: FileCheck2, title: 'Commande traçable', text: 'Une référence unique relie le client, le véhicule et les étapes de paiement.' },
    { icon: Wrench, title: 'Paiement vérifié', text: 'Le reçu ne confirme pas le paiement. Un administrateur vérifie réellement la réception des fonds.' },
    { icon: Headphones, title: 'Suivi par l’équipe', text: 'Les commandes apparaissent dans l’espace d’administration dès leur création.' },
    { icon: BadgeCheck, title: 'Reçu PDF', text: 'Téléchargez un reçu de commande qui précise clairement le statut du paiement.' },
  ]

  return (
    <section className="border-y border-line bg-surface py-20">
      <div className="shell">
        <SectionHeader
          eyebrow="Pourquoi Laurent Crash Autos"
          title="Ce que vous obtenez en passant par nous"
          description="Les informations et étapes disponibles avant et après la création de commande."
        />

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.title}>
              <div className="h-full rounded-card border border-line bg-white p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/** Le parcours est une vraie sequence : la numerotation porte l'information. */
export function Steps() {
  const steps = [
    { n: '01', title: 'Catalogue', text: 'Parcourez les véhicules accidentés proposés à la vente.' },
    { n: '02', title: 'Sélection', text: 'Consultez les détails, le prix et l’état du véhicule choisi.' },
    { n: '03', title: 'Formulaire client', text: 'Indiquez votre nom, votre téléphone et votre adresse e-mail.' },
    { n: '04', title: 'Commande', text: 'La commande est créée et le véhicule est réservé.' },
    { n: '05', title: 'Paiement et reçu', text: 'Utilisez le RIB ou le lien affiché, puis téléchargez le reçu PDF.' },
    { n: '06', title: 'Vérification', text: 'L’équipe confirme le paiement uniquement après réception réelle des fonds.' },
  ]

  return (
    <section className="shell py-20">
      <SectionHeader eyebrow="Le parcours" title="Du catalogue au paiement vérifié" />

      <Stagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <StaggerItem key={step.n}>
            <div className="border-t-2 border-accent pt-5">
              <span className="font-display text-sm font-semibold text-accent">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export const faqItems = [
  { q: 'Quels types de véhicules proposez-vous ?', a: 'Le catalogue présente des véhicules accidentés à vendre. Consultez chaque fiche pour connaître les dommages déclarés et l’état de fonctionnement.' },
  { q: 'Comment créer une commande ?', a: 'Sélectionnez un véhicule, renseignez vos coordonnées puis validez le formulaire. Une référence de commande est alors créée.' },
  { q: 'Comment payer ?', a: 'Après la création de la commande, la page indique le RIB ou le lien de paiement configuré par Laurent Crash Autos.' },
  { q: 'Le reçu PDF confirme-t-il mon paiement ?', a: 'Non. Le reçu confirme uniquement la création de la commande. Le paiement reste en attente jusqu’à sa vérification réelle par l’équipe.' },
  { q: 'Quand le véhicule est-il marqué vendu ?', a: 'Après réception effective du paiement et confirmation manuelle par un administrateur.' },
  { q: 'Où puis-je acheter ?', a: 'Laurent Crash Autos dessert principalement la France et la zone européenne. Contactez l’équipe pour vérifier les modalités liées à votre destination.' },
]

export function Faq({ items = faqItems }: { items?: { q: string; a: string }[] }) {
  return (
    <section className="shell py-20">
      <SectionHeader eyebrow="Questions frequentes" title="Les réponses avant l'appel" />

      <div className="mt-10 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium">
              {item.q}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function LocationSection() {
  return (
    <section className="border-t border-line bg-surface py-20">
      <div className="shell grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow">Ou nous trouver</p>
          <div className="rule-gold mt-3" />
          <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Un véhicule vous intéresse ?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Consultez sa fiche et son état, puis créez votre commande en ligne. L’équipe pourra répondre
            à vos questions sur le véhicule et les modalités de vente.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" />
              {siteConfig.contact.address}
            </li>
            <li className="flex gap-3">
              <CarFront className="h-5 w-5 shrink-0 text-accent" />
              {siteConfig.contact.hours}
            </li>
          </ul>

          <ButtonLink href="/contact" className="mt-8">
            Voir le catalogue
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="aspect-[4/3] overflow-hidden rounded-card border border-line shadow-soft">
            <iframe
              src={siteConfig.contact.mapEmbed}
              title={`Localisation de ${siteConfig.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
