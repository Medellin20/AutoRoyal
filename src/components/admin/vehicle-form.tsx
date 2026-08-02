'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, Plus, X } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/button'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/field'
import { createVehicle, updateVehicle } from '@/server/actions/vehicle'
import {
  categoryLabels, fuelLabels, offerTypeLabels, transmissionLabels, vehicleStatusLabels,
} from '@/lib/labels'
import type { Vehicle } from '@prisma/client'

type Props = { vehicle?: Vehicle }

/** Champ a valeurs multiples (equipements, documents). */
function TagInput({
  name,
  label,
  initial = [],
  placeholder,
}: {
  name: string
  label: string
  initial?: string[]
  placeholder: string
}) {
  const [values, setValues] = useState<string[]>(initial)
  const [draft, setDraft] = useState('')

  function add() {
    const value = draft.trim()
    if (!value || values.includes(value)) return
    setValues([...values, value])
    setDraft('')
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium">{label}</p>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          aria-label={label}
        />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {values.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={value}
              className="flex items-center gap-1.5 rounded-pill bg-surface px-3 py-1.5 text-sm"
            >
              <input type="hidden" name={name} value={value} />
              {value}
              <button
                type="button"
                onClick={() => setValues(values.filter((v) => v !== value))}
                aria-label={`Retirer ${value}`}
                className="text-muted hover:text-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [offerType, setOfferType] = useState(vehicle?.offerType ?? 'BOTH')

  const isEdit = Boolean(vehicle)
  const showSale = offerType !== 'RENT'
  const showRent = offerType !== 'SALE'

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = isEdit
        ? await updateVehicle(vehicle!.id, formData)
        : await createVehicle(formData)

      if (result.ok) {
        toast.success(result.message ?? 'Enregistre.')
        router.push('/admin/vehicules')
        router.refresh()
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6" noValidate>
      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Identification</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Reference interne" htmlFor="reference" required error={errors.reference?.[0]}>
            <Input id="reference" name="reference" defaultValue={vehicle?.reference} placeholder="VEH-0001" required />
          </Field>

          <Field label="Type d offre" htmlFor="offerType" required error={errors.offerType?.[0]}>
            <Select
              id="offerType"
              name="offerType"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as typeof offerType)}
            >
              {Object.entries(offerTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Statut" htmlFor="status" required error={errors.status?.[0]}>
            <Select id="status" name="status" defaultValue={vehicle?.status ?? 'AVAILABLE'}>
              {Object.entries(vehicleStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Marque" htmlFor="brand" required error={errors.brand?.[0]}>
            <Input id="brand" name="brand" defaultValue={vehicle?.brand} required />
          </Field>

          <Field label="Modele" htmlFor="model" required error={errors.model?.[0]}>
            <Input id="model" name="model" defaultValue={vehicle?.model} required />
          </Field>

          <Field label="Version" htmlFor="version" error={errors.version?.[0]}>
            <Input id="version" name="version" defaultValue={vehicle?.version ?? ''} placeholder="Ex : 1.8 Hybrid Lounge" />
          </Field>

          <Field label="Categorie" htmlFor="category" required error={errors.category?.[0]}>
            <Select id="category" name="category" defaultValue={vehicle?.category ?? 'BERLINE'}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Annee" htmlFor="year" required error={errors.year?.[0]}>
            <Input id="year" name="year" type="number" min={1980} defaultValue={vehicle?.year ?? new Date().getFullYear()} required />
          </Field>

          <Field label="Numero de chassis" htmlFor="vin" error={errors.vin?.[0]} hint="Facultatif, non affiche publiquement.">
            <Input id="vin" name="vin" defaultValue={vehicle?.vin ?? ''} />
          </Field>
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Tarifs</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          {showSale && (
            <Field label="Prix de vente" htmlFor="salePrice" required error={errors.salePrice?.[0]}>
              <Input id="salePrice" name="salePrice" type="number" min={0} step={10000} defaultValue={vehicle?.salePrice ? Number(vehicle.salePrice) : ''} />
            </Field>
          )}

          {showRent && (
            <>
              <Field label="Tarif journalier" htmlFor="dailyPrice" required error={errors.dailyPrice?.[0]}>
                <Input id="dailyPrice" name="dailyPrice" type="number" min={0} step={1000} defaultValue={vehicle?.dailyPrice ? Number(vehicle.dailyPrice) : ''} />
              </Field>

              <Field label="Tarif hebdomadaire" htmlFor="weeklyPrice" error={errors.weeklyPrice?.[0]}>
                <Input id="weeklyPrice" name="weeklyPrice" type="number" min={0} step={1000} defaultValue={vehicle?.weeklyPrice ? Number(vehicle.weeklyPrice) : ''} />
              </Field>

              <Field label="Tarif mensuel" htmlFor="monthlyPrice" error={errors.monthlyPrice?.[0]}>
                <Input id="monthlyPrice" name="monthlyPrice" type="number" min={0} step={5000} defaultValue={vehicle?.monthlyPrice ? Number(vehicle.monthlyPrice) : ''} />
              </Field>

              <Field label="Caution" htmlFor="deposit" error={errors.deposit?.[0]}>
                <Input id="deposit" name="deposit" type="number" min={0} step={5000} defaultValue={vehicle?.deposit ? Number(vehicle.deposit) : ''} />
              </Field>
            </>
          )}
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Fiche technique</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Kilometrage" htmlFor="mileage" required error={errors.mileage?.[0]}>
            <Input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage ?? 0} required />
          </Field>

          <Field label="Carburant" htmlFor="fuel" required error={errors.fuel?.[0]}>
            <Select id="fuel" name="fuel" defaultValue={vehicle?.fuel ?? 'ESSENCE'}>
              {Object.entries(fuelLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Transmission" htmlFor="transmission" required error={errors.transmission?.[0]}>
            <Select id="transmission" name="transmission" defaultValue={vehicle?.transmission ?? 'MANUELLE'}>
              {Object.entries(transmissionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Couleur" htmlFor="color" required error={errors.color?.[0]}>
            <Input id="color" name="color" defaultValue={vehicle?.color} required />
          </Field>

          <Field label="Nombre de places" htmlFor="seats" required error={errors.seats?.[0]}>
            <Input id="seats" name="seats" type="number" min={1} max={20} defaultValue={vehicle?.seats ?? 5} required />
          </Field>

          <Field label="Nombre de portes" htmlFor="doors" required error={errors.doors?.[0]}>
            <Input id="doors" name="doors" type="number" min={2} max={7} defaultValue={vehicle?.doors ?? 5} required />
          </Field>

          <Field label="Puissance (ch)" htmlFor="power" required error={errors.power?.[0]}>
            <Input id="power" name="power" type="number" min={1} defaultValue={vehicle?.power ?? 100} required />
          </Field>
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Contenu de la fiche</h2>

        <fieldset className="mt-5 space-y-5" disabled={pending}>
          <Field label="Description" htmlFor="description" required error={errors.description?.[0]} hint="Au moins 30 caracteres. Decrivez l etat reel, l historique et les points forts.">
            <Textarea id="description" name="description" rows={6} defaultValue={vehicle?.description} required />
          </Field>

          <TagInput
            name="features"
            label="Equipements"
            initial={vehicle?.features ?? []}
            placeholder="Climatisation, camera de recul..."
          />

          {showRent && (
            <>
              <Field label="Conditions de location" htmlFor="rentalConditions" error={errors.rentalConditions?.[0]}>
                <Textarea id="rentalConditions" name="rentalConditions" rows={4} defaultValue={vehicle?.rentalConditions ?? ''} />
              </Field>

              <TagInput
                name="requiredDocuments"
                label="Documents necessaires"
                initial={vehicle?.requiredDocuments ?? []}
                placeholder="Permis de conduire, piece d identite..."
              />
            </>
          )}

          <div className="flex flex-wrap gap-6 border-t border-line pt-5">
            <Checkbox name="featured" label="Mettre en avant sur l accueil" defaultChecked={vehicle?.featured} />
            <Checkbox name="published" label="Publier la fiche" defaultChecked={vehicle?.published} />
          </div>
        </fieldset>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {isEdit ? 'Enregistrer les modifications' : 'Creer le vehicule'}
        </Button>
        <ButtonLink href="/admin/vehicules" variant="secondary">
          Annuler
        </ButtonLink>
        {isEdit && vehicle?.slug && (
          <ButtonLink href={`/vehicules/${vehicle.slug}`} variant="ghost" target="_blank">
            <Eye className="h-4 w-4" />
            Previsualiser la fiche
          </ButtonLink>
        )}
      </div>
    </form>
  )
}
