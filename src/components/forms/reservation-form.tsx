'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { createReservation } from '@/server/actions/reservation'
import { siteConfig } from '@/config/site'
import { formatPrice, diffInDays } from '@/lib/utils'

type RentableVehicle = {
  id: string
  brand: string
  model: string
  year: number
  dailyPrice: unknown
  deposit: unknown
}

export function ReservationForm({
  vehicles,
  defaultVehicleId,
}: {
  vehicles: RentableVehicle[]
  defaultVehicleId?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [reference, setReference] = useState<string | null>(null)

  const [vehicleId, setVehicleId] = useState(defaultVehicleId ?? vehicles[0]?.id ?? '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickupPlace, setPickupPlace] = useState<string>(siteConfig.booking.pickupPlaces[0])
  const [returnPlace, setReturnPlace] = useState<string>(siteConfig.booking.pickupPlaces[0])

  const today = new Date().toISOString().slice(0, 10)
  const vehicle = vehicles.find((v) => v.id === vehicleId)

  /** Devis calcule en direct, recalcule cote serveur avant enregistrement. */
  const quote = useMemo(() => {
    if (!vehicle || !startDate || !endDate) return null
    const days = diffInDays(startDate, endDate)
    if (days < 1) return null

    const daily = Number(vehicle.dailyPrice ?? 0)
    const base = daily * days
    const extras =
      siteConfig.booking.serviceFee +
      (pickupPlace !== returnPlace ? siteConfig.booking.differentReturnFee : 0)

    return { days, base, extras, total: base + extras, deposit: Number(vehicle.deposit ?? 0) }
  }, [vehicle, startDate, endDate, pickupPlace, returnPlace])

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = await createReservation(formData)
      if (result.ok) {
        setReference(result.data?.reference ?? null)
        toast.success(result.message ?? 'Demande enregistree.')
        router.refresh()
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
        <h2 className="mt-4 font-display text-2xl font-semibold">Demande enregistree</h2>
        <p className="mt-2 text-sm text-muted">
          Votre reference : <span className="font-medium text-ink">{reference}</span>
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Un conseiller vous rappelle sous 24 h pour confirmer les dates et la remise des cles.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setReference(null)}>
          Faire une autre demande
        </Button>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]" noValidate>
      <div className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
        <fieldset className="space-y-4" disabled={pending}>
          <legend className="mb-2 font-display text-lg font-semibold">Le vehicule et les dates</legend>

          <Field label="Vehicule" htmlFor="vehicleId" required error={errors.vehicleId?.[0]}>
            <Select
              id="vehicleId"
              name="vehicleId"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              {vehicles.length === 0 && <option value="">Aucun vehicule disponible</option>}
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.year}) - {formatPrice(v.dailyPrice as never)} / jour
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date de debut" htmlFor="startDate" required error={errors.startDate?.[0]}>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Field>

            <Field label="Date de fin" htmlFor="endDate" required error={errors.endDate?.[0]}>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lieu de recuperation" htmlFor="pickupPlace" required error={errors.pickupPlace?.[0]}>
              <Select
                id="pickupPlace"
                name="pickupPlace"
                value={pickupPlace}
                onChange={(e) => setPickupPlace(e.target.value)}
              >
                {siteConfig.booking.pickupPlaces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>

            <Field
              label="Lieu de retour"
              htmlFor="returnPlace"
              required
              error={errors.returnPlace?.[0]}
              hint={
                pickupPlace !== returnPlace
                  ? `Retour dans un autre lieu : ${formatPrice(siteConfig.booking.differentReturnFee)}`
                  : undefined
              }
            >
              <Select
                id="returnPlace"
                name="returnPlace"
                value={returnPlace}
                onChange={(e) => setReturnPlace(e.target.value)}
              >
                {siteConfig.booking.pickupPlaces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6" disabled={pending}>
          <legend className="mb-2 font-display text-lg font-semibold">Vos coordonnees</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet" htmlFor="fullName" required error={errors.fullName?.[0]}>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </Field>

            <Field label="Telephone" htmlFor="phone" required error={errors.phone?.[0]}>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Ex. +33 6 XX XX XX XX" required />
            </Field>
          </div>

          <Field label="Adresse e-mail" htmlFor="email" required error={errors.email?.[0]}>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>

          <Field label="Adresse" htmlFor="address" required error={errors.address?.[0]}>
            <Input id="address" name="address" autoComplete="street-address" required />
          </Field>

          <Field label="Message" htmlFor="message" error={errors.message?.[0]}>
            <Textarea id="message" name="message" placeholder="Besoin d un siege enfant, d un chauffeur, d une livraison ?" />
          </Field>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Estimation</h2>

          {quote ? (
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Duree</dt>
                <dd className="font-medium">{quote.days} jour{quote.days > 1 ? 's' : ''}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Location</dt>
                <dd className="font-medium">{formatPrice(quote.base)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Frais de dossier</dt>
                <dd className="font-medium">{formatPrice(quote.extras)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-display font-semibold text-accent">{formatPrice(quote.total)}</dd>
              </div>
              {quote.deposit > 0 && (
                <p className="pt-1 text-xs text-muted">
                  Caution restituable : {formatPrice(quote.deposit)}
                </p>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Choisissez un vehicule et vos dates pour voir le total.
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" loading={pending} disabled={vehicles.length === 0}>
            Envoyer la demande
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            L envoi ne debite rien. Le paiement se fait a la remise des cles, apres confirmation.
          </p>
        </div>
      </aside>
    </form>
  )
}
