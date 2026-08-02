import Image from 'next/image'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { VehicleRowActions } from '@/components/admin/vehicle-row-actions'
import { StatusSelect } from '@/components/admin/status-select'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateVehicleStatus } from '@/server/actions/vehicle'
import { formatPrice, formatNumber } from '@/lib/utils'
import { vehicleStatusLabels } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(searchParams.q
        ? {
            OR: [
              { brand: { contains: searchParams.q, mode: 'insensitive' } },
              { model: { contains: searchParams.q, mode: 'insensitive' } },
              { reference: { contains: searchParams.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <PageHeader
        title="Vehicules"
        description={`${vehicles.length} fiche(s) au total.`}
        action={
          <ButtonLink href="/admin/vehicules/nouveau">
            <Plus className="h-4 w-4" />
            Ajouter un vehicule
          </ButtonLink>
        }
      />

      <div className="mb-5">
        <SearchInput placeholder="Marque, modele ou reference" />
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
          <h2 className="font-display text-lg font-semibold">Aucun vehicule ici</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Ajoutez une premiere fiche pour alimenter le catalogue public.
          </p>
          <ButtonLink href="/admin/vehicules/nouveau" className="mt-6">
            Ajouter un vehicule
          </ButtonLink>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-medium">Vehicule</th>
                <th className="px-5 py-3.5 font-medium">Reference</th>
                <th className="px-5 py-3.5 font-medium">Prix</th>
                <th className="px-5 py-3.5 font-medium">Km</th>
                <th className="px-5 py-3.5 font-medium">Statut</th>
                <th className="px-5 py-3.5 font-medium">Visibilite</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {vehicle.images[0] && (
                          <Image
                            src={vehicle.images[0].url}
                            alt={vehicle.images[0].alt}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-muted">{vehicle.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{vehicle.reference}</td>
                  <td className="px-5 py-3">
                    {vehicle.salePrice
                      ? formatPrice(vehicle.salePrice as never)
                      : `${formatPrice(vehicle.dailyPrice as never)} / j`}
                  </td>
                  <td className="px-5 py-3 text-muted">{formatNumber(vehicle.mileage)}</td>
                  <td className="px-5 py-3">
                    <StatusSelect
                      id={vehicle.id}
                      value={vehicle.status}
                      options={vehicleStatusLabels}
                      action={updateVehicleStatus}
                      ariaLabel={`Statut de ${vehicle.brand} ${vehicle.model}`}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={vehicle.published ? 'success' : 'neutral'}>
                      {vehicle.published ? 'Publie' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <VehicleRowActions
                      id={vehicle.id}
                      published={vehicle.published}
                      label={`${vehicle.brand} ${vehicle.model}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
