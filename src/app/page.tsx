import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { Hero } from '@/components/home/hero'
import {
  Advantages, Faq, LocationSection, OfferSplit, SectionHeader, Steps,
} from '@/components/home/sections'
import { SearchFilters } from '@/components/vehicles/search-filters'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { EmptyState } from '@/components/vehicles/empty-state'
import { getFeaturedVehicles, getFilterOptions } from '@/server/queries'

export const revalidate = 300

export default async function HomePage() {
  const [vehicles, options] = await Promise.all([getFeaturedVehicles(6), getFilterOptions()])

  return (
    <PublicShell>
      <Hero />

      <section className="shell relative z-10 -mt-8 pb-4 lg:-mt-12">
        <Suspense fallback={<div className="h-32 rounded-card border border-line bg-white" />}>
          <SearchFilters brands={options.brands} years={options.years} compact />
        </Suspense>
      </section>

      <section className="shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow="Selection du moment" title="Vehicules disponibles" />
          <Link href="/vehicules" className="flex items-center gap-2 text-sm font-medium text-accent">
            Tout le catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Le catalogue arrive"
              description="Les fiches sont en cours de preparation. Ecrivez-nous pour connaitre les vehicules deja disponibles."
              actionHref="/contact"
              actionLabel="Nous contacter"
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
            ))}
          </div>
        )}
      </section>

      <OfferSplit />
      <Advantages />
      <Steps />
      <Faq />
      <LocationSection />
    </PublicShell>
  )
}
