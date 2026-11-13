import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/public-shell'
import { SearchFilters } from '@/components/vehicles/search-filters'
import { SortSelect } from '@/components/vehicles/sort-select'
import { Pagination } from '@/components/vehicles/pagination'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { EmptyState } from '@/components/vehicles/empty-state'
import { VehicleGridSkeleton } from '@/components/ui/skeleton'
import { getVehicles, getFilterOptions } from '@/server/queries'
import { buildMetadata } from '@/lib/seo'
import type { VehicleFilters } from '@/types'

export const metadata: Metadata = buildMetadata({
  title: 'Catalogue des vehicules',
  description: 'Catalogue de véhicules accidentés à vendre en France et en Europe.',
  path: '/vehicules',
})

export const dynamic = 'force-dynamic'

async function VehicleGrid({ filters }: { filters: VehicleFilters }) {
  const { items, total, page, pages } = await getVehicles(filters)

  if (items.length === 0) return <EmptyState />

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        {total} vehicule{total > 1 ? 's' : ''} trouve{total > 1 ? 's' : ''}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((vehicle, i) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
        ))}
      </div>
      <Pagination page={page} pages={pages} />
    </>
  )
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: VehicleFilters
}) {
  const options = await getFilterOptions()

  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Catalogue</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Véhicules accidentés à vendre</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Consultez l’état, les dommages et les informations de chaque véhicule avant de commander.
          </p>
        </div>
      </section>

      <section className="shell py-10">
        <Suspense fallback={<div className="h-32 rounded-card border border-line bg-white" />}>
          <SearchFilters brands={options.brands} years={options.years} />
        </Suspense>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Resultats</h2>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        <div className="mt-6">
          <Suspense key={JSON.stringify(searchParams)} fallback={<VehicleGridSkeleton />}>
            <VehicleGrid filters={searchParams} />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  )
}
