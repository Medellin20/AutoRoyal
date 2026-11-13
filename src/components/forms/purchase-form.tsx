'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/field'
import { createPurchaseRequest } from '@/server/actions/purchase'
import { formatPrice } from '@/lib/utils'
import { paymentLabels } from '@/lib/labels'

type SellableVehicle = { id: string; brand: string; model: string; year: number; salePrice: unknown }

export function PurchaseForm({
  vehicles,
  defaultVehicleId,
}: {
  vehicles: SellableVehicle[]
  defaultVehicleId?: string
}) {
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [reference, setReference] = useState<string | null>(null)
  const [tradeIn, setTradeIn] = useState(false)

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await createPurchaseRequest(formData)
      if (result.ok) {
        setReference(result.data?.reference ?? null)
        toast.success(result.message ?? 'Demande envoyee.')
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  if (reference) {
    return (
      <div className="rounded-card border border-line bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Demande envoyee</h2>
        <p className="mt-2 text-sm text-muted">
          Reference : <span className="font-medium text-ink">{reference}</span>
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Un conseiller vous rappelle sous 24 h avec la fiche technique complete et les options de paiement.
        </p>
      </div>
    )
  }

  return (
    <form
      action={onSubmit}
      className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8"
      noValidate
    >
      <fieldset className="space-y-4" disabled={pending}>
        <Field label="Vehicule concerne" htmlFor="vehicleId" required error={errors.vehicleId?.[0]}>
          <Select id="vehicleId" name="vehicleId" defaultValue={defaultVehicleId} required>
            {vehicles.length === 0 && <option value="">Aucun vehicule a la vente</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.year}) - {formatPrice(v.salePrice as never)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" htmlFor="fullName" required error={errors.fullName?.[0]}>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </Field>
          <Field label="Telephone" htmlFor="phone" required error={errors.phone?.[0]}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
          </Field>
        </div>

        <Field label="Adresse e-mail" htmlFor="email" required error={errors.email?.[0]}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Budget" htmlFor="budget" error={errors.budget?.[0]} hint="Facultatif, aide le conseiller a preparer l offre.">
            <Input id="budget" name="budget" type="number" min={0} step={500} placeholder="Ex. 15 000" />
          </Field>

          <Field label="Mode de paiement souhaite" htmlFor="payment" error={errors.payment?.[0]}>
            <Select id="payment" name="payment" defaultValue="CASH">
              {Object.entries(paymentLabels).filter(([value]) => value !== 'MOBILE_MONEY').map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
          <Checkbox name="financing" label="Je souhaite etudier un financement" />
          <Checkbox
            name="tradeIn"
            label="Je souhaite reprendre mon vehicule actuel"
            checked={tradeIn}
            onChange={(e) => setTradeIn(e.target.checked)}
          />
          {tradeIn && (
            <Field label="Votre vehicule actuel" htmlFor="tradeInInfo" error={errors.tradeInInfo?.[0]}>
              <Input id="tradeInInfo" name="tradeInInfo" placeholder="Marque, modele, annee, kilometrage" />
            </Field>
          )}
        </div>

        <Field label="Message" htmlFor="message" error={errors.message?.[0]}>
          <Textarea id="message" name="message" placeholder="Une question sur l historique ou la garantie ?" />
        </Field>
      </fieldset>

      <Button type="submit" loading={pending} className="w-full sm:w-auto" disabled={vehicles.length === 0}>
        Envoyer la demande
      </Button>
    </form>
  )
}
