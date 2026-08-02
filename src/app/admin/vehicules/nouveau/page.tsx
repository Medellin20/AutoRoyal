import { PageHeader } from '@/components/admin/page-header'
import { VehicleForm } from '@/components/admin/vehicle-form'

export const metadata = { title: 'Ajouter un vehicule' }

export default function NewVehiclePage() {
  return (
    <>
      <PageHeader
        title="Ajouter un vehicule"
        description="Creez la fiche, puis ajoutez les photos a l etape suivante."
      />
      <VehicleForm />
    </>
  )
}
