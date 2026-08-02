import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Armchair, Calendar, DoorOpen, Fuel, Gauge, MessageCircle, Palette, Settings2, Zap, FileText, ShieldCheck,
} from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { Gallery } from '@/components/vehicles/gallery'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { ShareButton } from '@/components/vehicles/share-button'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/ui/motion'
import { getVehicleBySlug, getSimilarVehicles } from '@/server/queries'
import { incrementVehicleViews } from '@/server/actions/vehicle'
import { formatPrice, formatNumber, whatsappLink } from '@/lib/utils'
import {
  categoryLabels, fuelLabels, transmissionLabels, vehicleStatusLabels, vehicleStatusTone,
} from '@/lib/labels'
import { siteConfig } from '@/config/site'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 120

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await getVehicleBySlug(params.slug)
  if (!vehicle) return buildMetadata({ title: 'Vehicule introuvable', path: `/vehicules/${params.slug}` })

  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
  const main = vehicle.images.find((i) => i.isMain) ?? vehicle.images[0]

  return buildMetadata({
    title,
    description: `${title} - ${formatNumber(vehicle.mileage)} km, ${fuelLabels[vehicle.fuel]}, ${transmissionLabels[vehicle.transmission]}. ${vehicle.description.slice(0, 110)}`,
    path: `/vehicules/${vehicle.slug}`,
    image: main?.url,
  })
}

export default async function VehiclePage({ params }: { params: { slug: string } }) {
  const vehicle = await getVehicleBySlug(params.slug)
  if (!vehicle) notFound()

  const similar = await getSimilarVehicles(vehicle.id, vehicle.category)
  await incrementVehicleViews(vehicle.id)

  const title = `${vehicle.brand} ${vehicle.model}`
  const canRent = vehicle.offerType !== 'SALE'
  const canBuy = vehicle.offerType !== 'RENT'
  const available = vehicle.status === 'AVAILABLE'

  const specs = [
    { icon: Calendar, label: 'Annee', value: String(vehicle.year) },
    { icon: Gauge, label: 'Kilometrage', value: `${formatNumber(vehicle.mileage)} km` },
    { icon: Fuel, label: 'Carburant', value: fuelLabels[vehicle.fuel] },
    { icon: Settings2, label: 'Transmission', value: transmissionLabels[vehicle.transmission] },
    { icon: Palette, label: 'Couleur', value: vehicle.color },
    { icon: Armchair, label: 'Places', value: String(vehicle.seats) },
    { icon: DoorOpen, label: 'Portes', value: String(vehicle.doors) },
    { icon: Zap, label: 'Puissance', value: `${vehicle.power} ch` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${title} ${vehicle.year}`,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' },
    fuelType: fuelLabels[vehicle.fuel],
    vehicleTransmission: transmissionLabels[vehicle.transmission],
    ...(vehicle.salePrice && {
      offers: {
        '@type': 'Offer',
        price: Number(vehicle.salePrice),
        priceCurrency: siteConfig.currency,
        availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    }),
  }

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="shell py-8">
        <nav aria-label="Fil d ariane" className="text-sm text-muted">
          <Link href="/" className="hover:text-accent">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/vehicules" className="hover:text-accent">Vehicules</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <Gallery images={vehicle.images} title={title} />

            <Reveal className="mt-10">
              <h2 className="font-display text-xl font-semibold">Caracteristiques</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-2xl border border-line bg-white p-4">
                    <spec.icon className="h-4 w-4 text-accent" aria-hidden />
                    <dt className="mt-2 text-xs text-muted">{spec.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="font-display text-xl font-semibold">Description</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/85">
                {vehicle.description}
              </p>
            </Reveal>

            {vehicle.features.length > 0 && (
              <Reveal className="mt-10">
                <h2 className="font-display text-xl font-semibold">Equipements</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-ink/85">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {canRent && vehicle.rentalConditions && (
              <Reveal className="mt-10 rounded-card border border-line bg-surface p-6">
                <h2 className="font-display text-xl font-semibold">Conditions de location</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {vehicle.rentalConditions}
                </p>
                {vehicle.requiredDocuments.length > 0 && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold">Documents a fournir</h3>
                    <ul className="mt-3 space-y-2">
                      {vehicle.requiredDocuments.map((doc) => (
                        <li key={doc} className="flex items-center gap-2.5 text-sm text-muted">
                          <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={vehicleStatusTone[vehicle.status]}>{vehicleStatusLabels[vehicle.status]}</Badge>
                <Badge tone="neutral">{categoryLabels[vehicle.category]}</Badge>
                <span className="ml-auto text-xs text-muted">Ref. {vehicle.reference}</span>
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight">
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {vehicle.version ? `${vehicle.version} - ` : ''}{vehicle.year}
              </p>

              <div className="mt-6 space-y-4 border-t border-line pt-6">
                {canBuy && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Prix de vente</span>
                    <span className="font-display text-2xl font-semibold text-accent">
                      {formatPrice(vehicle.salePrice as never)}
                    </span>
                  </div>
                )}

                {canRent && (
                  <dl className="space-y-2 rounded-2xl bg-surface p-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Par jour</dt>
                      <dd className="font-medium">{formatPrice(vehicle.dailyPrice as never)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Par semaine</dt>
                      <dd className="font-medium">{formatPrice(vehicle.weeklyPrice as never)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Par mois</dt>
                      <dd className="font-medium">{formatPrice(vehicle.monthlyPrice as never)}</dd>
                    </div>
                    {vehicle.deposit && (
                      <div className="flex justify-between border-t border-line pt-2">
                        <dt className="text-muted">Caution</dt>
                        <dd className="font-medium">{formatPrice(vehicle.deposit as never)}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {canRent && (
                  <ButtonLink
                    href={`/reservation?vehicule=${vehicle.id}`}
                    className="w-full"
                    aria-disabled={!available}
                  >
                    Reserver ce vehicule
                  </ButtonLink>
                )}
                {canBuy && (
                  <ButtonLink
                    href={`/demande-achat?vehicule=${vehicle.id}`}
                    variant={canRent ? 'secondary' : 'primary'}
                    className="w-full"
                  >
                    Demander a l&apos;acheter
                  </ButtonLink>
                )}
                <a
                  href={whatsappLink(`Bonjour, je suis interesse par le ${title} ${vehicle.year} (ref. ${vehicle.reference}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-[#25D366] text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ecrire sur WhatsApp
                </a>
                <ShareButton title={title} url={`${siteConfig.url}/vehicules/${vehicle.slug}`} />
              </div>

              {!available && (
                <p className="mt-4 rounded-xl bg-warning/10 p-3 text-xs text-warning">
                  Ce vehicule est actuellement {vehicleStatusLabels[vehicle.status].toLowerCase()}.
                  Ecrivez-nous pour connaitre sa date de retour.
                </p>
              )}
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold">Vehicules similaires</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  )
}
