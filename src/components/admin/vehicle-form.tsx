'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, Plus, X } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/button'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/field'
import { createVehicle, updateVehicle } from '@/server/actions/vehicle'
import {
  categoryLabels, damageLevelLabels, fuelLabels, transmissionLabels, vehicleStatusLabels,
} from '@/lib/labels'
import type { Vehicle } from '@/types/database'

type Props = { vehicle?: Vehicle }

/** Champ a valeurs multiples (equipements, documents). */
function TagInput({
  name,
  label,
  initial = [],
  placeholder,
  required = false,
  error,
}: {
  name: string
  label: string
  initial?: string[]
  placeholder: string
  required?: boolean
  error?: string
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
      <p className="mb-1.5 block text-sm font-medium">
        {label}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
      </p>

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
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}

export function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const isEdit = Boolean(vehicle)

  function onSubmit(formData: FormData) {
    setErrors({})
    startTransition(async () => {
      const result = isEdit
        ? await updateVehicle(vehicle!.id, formData)
        : await createVehicle(formData)

      if (result.ok) {
        toast.success(result.message ?? 'Enregistre.')
        router.push(result.data?.id ? `/admin/vehicules/${result.data.id}` : '/admin/vehicules')
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

        <input type="hidden" name="offerType" value="SALE" />
        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Titre de l’annonce" htmlFor="title" required error={errors.title?.[0]}>
            <Input id="title" name="title" defaultValue={vehicle?.title} placeholder="Ex. Peugeot 308 accidentée, 2021" required />
          </Field>
          <Field label="Référence interne" htmlFor="reference" error={errors.reference?.[0]} hint="Facultatif : une référence sera générée automatiquement si le champ reste vide.">
            <Input id="reference" name="reference" defaultValue={vehicle?.reference} placeholder="Générée automatiquement" />
          </Field>

          <Field label="Disponibilité" htmlFor="status" required error={errors.status?.[0]} hint="Le statut Brouillon ou Publié se règle séparément en bas du formulaire.">
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

          <Field label="Type de véhicule" htmlFor="vehicleType" required error={errors.vehicleType?.[0]}>
            <Select id="vehicleType" name="vehicleType" defaultValue={vehicle?.vehicleType ?? 'VOITURE'}>
              <option value="VOITURE">Voiture</option><option value="UTILITAIRE">Utilitaire</option>
              <option value="MOTO">Moto</option><option value="CAMION">Camion</option><option value="AUTRE">Autre</option>
            </Select>
          </Field>

          <Field label="Annee" htmlFor="year" required error={errors.year?.[0]}>
            <Input id="year" name="year" type="number" min={1980} defaultValue={vehicle?.year ?? new Date().getFullYear()} required />
          </Field>

          <Field label="VIN / numéro de châssis" htmlFor="vin" error={errors.vin?.[0]} hint="Facultatif, non affiché publiquement.">
            <Input id="vin" name="vin" defaultValue={vehicle?.vin ?? ''} maxLength={24} />
          </Field>
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">État après accident</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2" disabled={pending}>
          <Field label="Niveau de dommages" htmlFor="damageLevel" required error={errors.damageLevel?.[0]}>
            <Select id="damageLevel" name="damageLevel" defaultValue={vehicle?.damageLevel ?? 'A_DEFINIR'}>
              {Object.entries(damageLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="État de fonctionnement" htmlFor="runningCondition" required error={errors.runningCondition?.[0]}>
            <Select id="runningCondition" name="runningCondition" defaultValue={vehicle?.runningCondition ?? 'A_VERIFIER'}>
              <option value="ROULANT">Run &amp; Drive</option><option value="DEMARRE">Démarre uniquement</option>
              <option value="NON_ROULANT">Ne démarre pas</option><option value="A_VERIFIER">État inconnu</option>
            </Select>
          </Field>
          <Field label="État de la carrosserie" htmlFor="bodyCondition" required error={errors.bodyCondition?.[0]}>
            <Select id="bodyCondition" name="bodyCondition" defaultValue={vehicle?.bodyCondition ?? 'A_VERIFIER'}>
              <option value="BON">Bon</option><option value="MOYEN">Moyen</option><option value="ENDOMMAGE">Endommagé</option><option value="A_VERIFIER">À vérifier</option>
            </Select>
          </Field>
          <Field label="État du titre" htmlFor="titleStatus" required error={errors.titleStatus?.[0]}>
            <Select id="titleStatus" name="titleStatus" defaultValue={vehicle?.titleStatus ?? 'A_VERIFIER'}>
              <option value="A_VERIFIER">À vérifier</option><option value="CLAIR">Clair</option><option value="ACCIDENTE">Accidenté</option><option value="MANQUANT">Manquant</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <TagInput name="damageTypes" label="Zones ou types de dommages" initial={vehicle?.damageTypes ?? []} placeholder="Avant, aile gauche, airbags..." required error={errors.damageTypes?.[0]} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Description des dommages" htmlFor="damageDescription" required error={errors.damageDescription?.[0]}>
              <Textarea id="damageDescription" name="damageDescription" rows={4} defaultValue={vehicle?.damageDescription} placeholder="Décrivez précisément les dommages connus et les éléments à contrôler." required />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <TagInput name="requiredDocuments" label="Documents et rapports disponibles" initial={vehicle?.requiredDocuments ?? []} placeholder="Carte grise, rapport d’expertise..." />
          </div>
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Vente à prix fixe</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Prix de vente" htmlFor="salePrice" required error={errors.salePrice?.[0]}>
            <Input id="salePrice" name="salePrice" type="number" min={1} step={100} defaultValue={vehicle?.salePrice ? Number(vehicle.salePrice) : ''} required />
          </Field>
          <Field label="Devise" htmlFor="currency" required error={errors.currency?.[0]}>
            <Select id="currency" name="currency" defaultValue={vehicle?.currency ?? 'EUR'}>
              <option value="EUR">EUR — Euro</option><option value="USD">USD — Dollar</option><option value="GBP">GBP — Livre sterling</option><option value="XOF">XOF — Franc CFA</option>
            </Select>
          </Field>
          <Field label="Acompte éventuel" htmlFor="deposit" error={errors.deposit?.[0]}>
            <Input id="deposit" name="deposit" type="number" min={0} step={50} defaultValue={vehicle?.deposit ? Number(vehicle.deposit) : ''} />
          </Field>
          <Field label="Quantité disponible" htmlFor="quantity" required error={errors.quantity?.[0]}>
            <Input id="quantity" name="quantity" type="number" min={0} max={1000} defaultValue={vehicle?.quantity ?? 1} required />
          </Field>
          <div className="flex items-end pb-2"><Checkbox name="internationalSale" label="Vente internationale possible" defaultChecked={vehicle?.internationalSale} /></div>
        </fieldset>
      </section>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Fiche technique</h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Kilometrage" htmlFor="mileage" required error={errors.mileage?.[0]}>
            <Input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage ?? 0} required />
          </Field>
          <Field label="Nombre de clés" htmlFor="keysCount" required error={errors.keysCount?.[0]}>
            <Input id="keysCount" name="keysCount" type="number" min={0} max={20} defaultValue={vehicle?.keysCount ?? 1} required />
          </Field>

          <Field label="Motorisation" htmlFor="engine" required error={errors.engine?.[0]}>
            <Input id="engine" name="engine" defaultValue={vehicle?.engine} placeholder="2.0 TDI, électrique..." required />
          </Field>
          <Field label="Cylindrée (cm³)" htmlFor="displacement" required error={errors.displacement?.[0]}>
            <Input id="displacement" name="displacement" type="number" min={0} max={20000} defaultValue={vehicle?.displacement ?? 0} required />
          </Field>
          <Field label="Transmission / motricité" htmlFor="drivetrain" required error={errors.drivetrain?.[0]}>
            <Select id="drivetrain" name="drivetrain" defaultValue={vehicle?.drivetrain ?? 'AUTRE'}>
              <option value="TRACTION">Traction</option><option value="PROPULSION">Propulsion</option><option value="INTEGRALE">Intégrale</option><option value="AUTRE">Autre / inconnue</option>
            </Select>
          </Field>

          <Field label="Carburant" htmlFor="fuel" required error={errors.fuel?.[0]}>
            <Select id="fuel" name="fuel" defaultValue={vehicle?.fuel ?? 'ESSENCE'}>
              {Object.entries(fuelLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Boîte de vitesses" htmlFor="transmission" required error={errors.transmission?.[0]}>
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
        <h2 className="font-display text-lg font-semibold">Localisation et vidéo</h2>
        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" disabled={pending}>
          <Field label="Ville" htmlFor="city" required error={errors.city?.[0]}><Input id="city" name="city" defaultValue={vehicle?.city} required /></Field>
          <Field label="Pays" htmlFor="country" required error={errors.country?.[0]}><Input id="country" name="country" defaultValue={vehicle?.country ?? 'France'} required /></Field>
          <Field label="Lien vidéo (facultatif)" htmlFor="videoUrl" error={errors.videoUrl?.[0]}><Input id="videoUrl" name="videoUrl" type="url" defaultValue={vehicle?.videoUrl ?? ''} placeholder="https://..." /></Field>
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

          <div className="flex flex-wrap gap-6 border-t border-line pt-5">
            <Checkbox name="featured" label="Mettre en avant sur l accueil" defaultChecked={vehicle?.featured} />
            {isEdit && <Checkbox name="published" label="Annonce publiée (sinon brouillon)" defaultChecked={vehicle?.published} />}
          </div>
        </fieldset>
      </section>

      {!isEdit && (
        <p className="rounded-xl border border-accent/20 bg-accent-soft p-4 text-sm text-ink">
          La fiche sera d’abord enregistrée en brouillon. Vous pourrez ajouter plusieurs photos, choisir la photo principale, puis publier l’annonce.
        </p>
      )}

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
