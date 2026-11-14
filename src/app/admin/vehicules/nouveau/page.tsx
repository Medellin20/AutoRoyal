import { PageHeader } from '@/components/admin/page-header'
import { VehicleForm } from '@/components/admin/vehicle-form'

export const metadata = { title: 'Ajouter un vehicule' }

export default function NewVehiclePage() {
  return (
    <>
      <PageHeader
        title="Ajouter un vehicule"
        description="Renseignez les informations. Après l’enregistrement, ajoutez les photos et choisissez l’image principale avant publication."
      />
      <VehicleForm />
    </>
  )
}
