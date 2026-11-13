import Image from 'next/image'
import Link from 'next/link'
import {
  BadgeCheck, Banknote, CalendarCheck, CarFront, FileCheck2, Headphones,
  KeyRound, MapPin, Quote, ShieldCheck, Wrench, Star,
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

/** Deux portes d'entree : acheter ou louer. */
export function OfferSplit() {
  const offers = [
    {
      title: 'Acheter',
      href: '/vehicules?offerType=SALE',
      image: '/images/offer-sale.svg',
      text: "Vehicules revises, historique verifie, garantie 6 mois sur le moteur et la boite.",
      cta: 'Voir les vehicules a vendre',
      icon: KeyRound,
    },
    {
      title: 'Louer',
      href: '/vehicules?offerType=RENT',
      image: '/images/offer-rent.svg',
      text: 'A la journee, a la semaine ou au mois. Assurance incluse, kilometrage genereux.',
      cta: 'Voir les vehicules a louer',
      icon: CalendarCheck,
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
    { icon: ShieldCheck, title: 'Controle en 42 points', text: "Freins, embrayage, suspension, climatisation : rien n'est mis en ligne sans passer l'atelier." },
    { icon: Banknote, title: 'Prix affiches', text: 'Le tarif que vous lisez est celui que vous payez. Les frais sont detailles avant signature.' },
    { icon: FileCheck2, title: 'Papiers en regle', text: 'Carte grise, assurance et visite technique remis le jour de la livraison.' },
    { icon: Wrench, title: 'Atelier integre', text: 'Une panne pendant la location ? Un vehicule de remplacement sous 4 h.' },
    { icon: Headphones, title: 'Un interlocuteur unique', text: 'Le conseiller qui prend votre appel suit votre dossier jusqu au bout.' },
    { icon: BadgeCheck, title: 'Garantie 6 mois', text: 'Moteur et boite couverts sur tous les vehicules vendus, sans franchise cachee.' },
  ]

  return (
    <section className="border-y border-line bg-surface py-20">
      <div className="shell">
        <SectionHeader
          eyebrow="Pourquoi Laurent Crash Autos"
          title="Ce que vous obtenez en passant par nous"
          description="Six engagements que nous tenons sur chaque dossier, en vente comme en location."
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
    { n: '01', title: 'Choisissez', text: 'Filtrez par budget, categorie et carburant. Chaque fiche indique le kilometrage reel.' },
    { n: '02', title: 'Reservez en ligne', text: 'Dates, lieu de retrait et coordonnees. Le total s affiche avant l envoi.' },
    { n: '03', title: 'Confirmez', text: 'Un conseiller vous rappelle sous 24 h pour valider les documents.' },
    { n: '04', title: 'Repartez', text: 'Retrait en agence ou livraison a domicile, cles en main.' },
  ]

  return (
    <section className="shell py-20">
      <SectionHeader eyebrow="Le parcours" title="Quatre etapes, rien de plus" />

      <Stagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

export function Testimonials() {
  const reviews = [
    { name: 'Fabrice A.', role: 'Location 15 jours', text: "Vehicule livre a l heure devant chez moi, propre, plein fait. Le contrat tenait sur une page et tout etait dedans." },
    { name: 'Nadege K.', role: 'Achat Corolla 2019', text: "J ai pu faire verifier la voiture par mon mecanicien avant de signer. Aucun blocage, aucune pression." },
    { name: 'Serge D.', role: 'Location longue duree', text: "Trois mois de location pour une mission. Facture claire chaque mois, entretien pris en charge." },
  ]

  return (
    <section className="border-y border-line bg-surface py-20">
      <div className="shell">
        <SectionHeader eyebrow="Ils ont teste" title="Ce que disent nos clients" align="center" />

        <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <StaggerItem key={review.name}>
              <figure className="h-full rounded-card border border-line bg-white p-6 shadow-soft">
                <Quote className="h-6 w-6 text-gold" aria-hidden />
                <blockquote className="mt-4 text-sm leading-relaxed text-ink/85">{review.text}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                    {review.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{review.name}</span>
                    <span className="block text-xs text-muted">{review.role}</span>
                  </span>
                  <span className="ml-auto flex gap-0.5" aria-label="5 etoiles sur 5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

export const faqItems = [
  { q: 'Quels documents faut-il pour louer ?', a: "Une piece d'identite en cours de validite, un permis de conduire et un justificatif de domicile. Les conditions exactes sont confirmees au devis." },
  { q: 'La caution est-elle bloquée ?', a: "Elle est encaissee au depart et restituee sous 72 h apres le retour du vehicule, deduction faite d eventuels dommages constates a l etat des lieux." },
  { q: 'Puis-je faire expertiser un vehicule avant d acheter ?', a: "Oui. Vous pouvez venir avec votre mecanicien ou demander un essai routier sur rendez-vous, sans engagement." },
  { q: 'Proposez-vous un financement ?', a: "Nous travaillons avec deux partenaires bancaires. Indiquez-le dans votre demande d achat et un conseiller monte le dossier avec vous." },
  { q: 'Le kilometrage est-il limite en location ?', a: "Le kilometrage inclus et le tarif des kilometres supplementaires sont precises sur chaque offre et au contrat." },
  { q: 'Que se passe-t-il en cas de panne ?', a: "Appelez l atelier : depannage sur place ou vehicule de remplacement sous 4 h pendant les heures d ouverture." },
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
            Passez à l&apos;agence, l&apos;essai est libre
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Le parc est visible sur place du lundi au samedi. Prenez rendez-vous pour un essai routier
            ou venez simplement voir les vehicules disponibles.
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
            Prendre rendez-vous
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
