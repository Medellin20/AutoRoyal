'use client'

import { VehicleCard } from './vehicle-card'
import { EmptyState } from './empty-state'
import { VehicleGridSkeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/hooks/use-favorites'
import type { VehicleWithImages } from '@/types'

export function FavoritesGrid({ vehicles }: { vehicles: VehicleWithImages[] }) {
  const { ids, ready } = useFavorites()

  if (!ready) return <VehicleGridSkeleton count={3} />

  const selected = vehicles.filter((v) => ids.includes(v.id))

  if (selected.length === 0) {
    return (
      <EmptyState
        title="Votre liste est vide"
        description="Touchez le coeur sur une fiche pour garder un vehicule sous la main."
        actionHref="/vehicules"
        actionLabel="Parcourir le catalogue"
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {selected.map((vehicle, i) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
      ))}
    </div>
  )
}
