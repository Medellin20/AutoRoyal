'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Fuel, Gauge, Heart, Settings2, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatNumber, cn } from '@/lib/utils'
import { fuelLabels, transmissionLabels, vehicleStatusLabels, vehicleStatusTone } from '@/lib/labels'
import { useFavorites } from '@/hooks/use-favorites'
import type { VehicleWithImages } from '@/types'

const PLACEHOLDER = '/images/placeholder-vehicle.svg'

export function VehicleCard({ vehicle, index = 0 }: { vehicle: VehicleWithImages; index?: number }) {
  const { isFavorite, toggle, ready } = useFavorites()
  const main = vehicle.images.find((i) => i.isMain) ?? vehicle.images[0]
  const favorite = ready && isFavorite(vehicle.id)

  const price =
    vehicle.offerType === 'RENT'
      ? `${formatPrice(vehicle.dailyPrice as never)} / jour`
      : formatPrice(vehicle.salePrice as never)

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group overflow-hidden rounded-card border border-line bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={main?.url ?? PLACEHOLDER}
          alt={main?.alt ?? `${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={vehicleStatusTone[vehicle.status]} className="bg-white/95 backdrop-blur">
            {vehicleStatusLabels[vehicle.status]}
          </Badge>
          {vehicle.featured && <Badge tone="gold" className="bg-white/95 backdrop-blur">Coup de coeur</Badge>}
        </div>

        <button
          type="button"
          onClick={() => toggle(vehicle.id)}
          aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={favorite}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-ink shadow-soft backdrop-blur transition-colors hover:text-accent"
        >
          <Heart className={cn('h-4 w-4', favorite && 'fill-accent text-accent')} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              {vehicle.version ? `${vehicle.version} - ` : ''}
              {vehicle.year}
            </p>
          </div>
          <p className="shrink-0 text-right font-display text-base font-semibold text-accent">{price}</p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent/70" aria-hidden />
            <dd>{formatNumber(vehicle.mileage)} km</dd>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-accent/70" aria-hidden />
            <dd>{fuelLabels[vehicle.fuel]}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-accent/70" aria-hidden />
            <dd>{transmissionLabels[vehicle.transmission]}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent/70" aria-hidden />
            <dd>{vehicle.year}</dd>
          </div>
        </dl>

        <Link
          href={`/vehicules/${vehicle.slug}`}
          className="mt-5 flex h-10 w-full items-center justify-center rounded-pill border border-line text-sm font-medium transition-colors hover:border-accent hover:bg-accent hover:text-white"
        >
          Voir les details
        </Link>
      </div>
    </motion.article>
  )
}
