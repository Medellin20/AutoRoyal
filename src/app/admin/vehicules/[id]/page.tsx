import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/admin/page-header'
import { VehicleForm } from '@/components/admin/vehicle-form'
import { ImageManager } from '@/components/admin/image-manager'

export const metadata = { title: 'Modifier un vehicule' }
export const dynamic = 'force-dynamic'

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: 'asc' } } },
  })

  if (!vehicle) notFound()

  return (
    <>
      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description={`Reference ${vehicle.reference} - ${vehicle.views} consultation(s).`}
      />

      <div className="space-y-6">
        <ImageManager vehicleId={vehicle.id} images={vehicle.images} />
        <VehicleForm vehicle={vehicle} />
      </div>
    </>
  )
}
