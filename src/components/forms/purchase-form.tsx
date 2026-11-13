'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/field'
import { createSalesOrder } from '@/server/actions/sales-orders'
import { formatPrice } from '@/lib/utils'

type SellableVehicle = { id: string; brand: string; model: string; year: number; reference: string; salePrice: unknown; currency: string; title: string; quantity: number }

export function PurchaseForm({
  vehicles,
  defaultVehicleId,
}: {
  vehicles: SellableVehicle[]
  defaultVehicleId?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await createSalesOrder(formData)
      if (result.ok && result.data) {
        toast.success('Commande créée. Le paiement attend la vérification de Laurent Crash Autos.')
        router.push(`/commande/${encodeURIComponent(result.data.reference)}?token=${encodeURIComponent(result.data.accessToken)}`)
      } else if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      } else {
        toast.error('La commande a été créée mais sa référence est indisponible.')
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8" noValidate>
      <div className="rounded-xl border border-accent/20 bg-accent-soft p-4 text-sm leading-relaxed">
        <p className="font-semibold">Commande et paiement par virement ou lien sécurisé</p>
        <p className="mt-1 text-muted">Le véhicule est réservé à la création de la commande. Son statut ne passera à « vendu » qu’après vérification effective du paiement par l’équipe.</p>
      </div>

      <fieldset className="space-y-4" disabled={pending}>
        <Field label="Véhicule accidenté" htmlFor="vehicleId" required error={errors.vehicleId?.[0]}>
          <Select id="vehicleId" name="vehicleId" defaultValue={defaultVehicleId} required>
            <option value="">Choisir un véhicule</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.title || `${vehicle.brand} ${vehicle.model}`} ({vehicle.year}) · réf. {vehicle.reference} · {formatPrice(vehicle.salePrice as never, vehicle.currency)} · {vehicle.quantity} disponible(s)
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" htmlFor="fullName" required error={errors.fullName?.[0]}>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </Field>
          <Field label="Téléphone" htmlFor="phone" required error={errors.phone?.[0]}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
          </Field>
        </div>
        <Field label="Adresse e-mail" htmlFor="email" required error={errors.email?.[0]}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </fieldset>

      <Button type="submit" loading={pending} className="w-full sm:w-auto" disabled={vehicles.length === 0}>
        Créer la commande
      </Button>
    </form>
  )
}
