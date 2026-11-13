import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { ContactForm } from '@/components/forms/contact-form'
import { siteConfig } from '@/config/site'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: `Contacter ${siteConfig.name} pour une demande concernant la France metropolitaine ou l Europe.`,
  path: '/contact',
})

export default function ContactPage() {
  const details = [
    { icon: MapPin, label: 'Zone desservie', value: siteConfig.contact.address },
    ...(siteConfig.contact.phone ? [{ icon: Phone, label: 'Telephone', value: siteConfig.contact.phone, href: `tel:${String(siteConfig.contact.phone).replace(/\s/g, '')}` }] : []),
    { icon: Mail, label: 'E-mail', value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { icon: Clock, label: 'Horaires', value: siteConfig.contact.hours },
  ]

  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Contact</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Parlons de votre projet</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Une question sur un vehicule, un devis longue duree, un essai a programmer : ecrivez-nous.
          </p>
        </div>
      </section>

      <section className="shell grid gap-12 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-xl font-semibold">Coordonnees</h2>
          <ul className="mt-6 space-y-5">
            {details.map((item) => (
              <li key={item.label} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <item.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted">{item.label}</span>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium hover:text-accent">{item.value}</a>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 aspect-[4/3] overflow-hidden rounded-card border border-line">
            <iframe
              src={siteConfig.contact.mapEmbed}
              title={`Localisation de ${siteConfig.name}`}
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>
        </div>

        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-semibold">Ecrire un message</h2>
          <p className="mt-1.5 text-sm text-muted">Reponse sous 24 h ouvrees.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
