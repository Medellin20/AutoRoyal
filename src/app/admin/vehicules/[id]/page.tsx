import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getAdminVehiclesWithImages } from '@/server/vehicle-data'
import type { Vehicle } from '@/types/database'
import { PageHeader } from '@/components/admin/page-header'
import { VehicleForm } from '@/components/admin/vehicle-form'
import { ImageManager } from '@/components/admin/image-manager'

export const metadata = { title: 'Modifier un vehicule' }
export const dynamic = 'force-dynamic'

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const { data, error } = await getSupabaseAdmin().from('vehicles').select('*').eq('id', params.id).maybeSingle()
  if (error) throw new Error(error.message)
  const [vehicle] = data ? await getAdminVehiclesWithImages([data as Vehicle]) : []

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
