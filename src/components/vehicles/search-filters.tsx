'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Field } from '@/components/ui/field'
import { categoryLabels, fuelLabels, transmissionLabels } from '@/lib/labels'

type Props = {
  brands: string[]
  years: number[]
  /** Version compacte pour la page d'accueil. */
  compact?: boolean
}

export function SearchFilters({ brands, years, compact = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [openAdvanced, setOpenAdvanced] = useState(false)

  const get = (key: string) => params.get(key) ?? ''

  const apply = useCallback(
    (formData: FormData) => {
      const next = new URLSearchParams()
      formData.forEach((value, key) => {
        const v = String(value).trim()
        if (v) next.set(key, v)
      })
      const target = compact ? '/vehicules' : pathname
      startTransition(() => router.push(`${target}?${next.toString()}`))
    },
    [compact, pathname, router],
  )

  const reset = () => startTransition(() => router.push(compact ? '/' : '/vehicules'))
  const activeCount = Array.from(params.keys()).filter((k) => k !== 'page' && k !== 'sort').length

  return (
    <form
      action={apply}
      className="rounded-card border border-line bg-white p-4 shadow-soft sm:p-5"
      role="search"
      aria-label="Rechercher un vehicule"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            name="q"
            defaultValue={get('q')}
            placeholder="Marque, modele ou reference"
            aria-label="Mot-cle"
            className="pl-10"
          />
        </div>

        <Select name="brand" defaultValue={get('brand')} aria-label="Marque">
          <option value="">Toutes les marques</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>

      {!compact && openAdvanced && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Modele" htmlFor="model">
            <Input id="model" name="model" defaultValue={get('model')} placeholder="Ex : Corolla" />
          </Field>

          <Field label="Categorie" htmlFor="category">
            <Select id="category" name="category" defaultValue={get('category')}>
              <option value="">Toutes</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Carburant" htmlFor="fuel">
            <Select id="fuel" name="fuel" defaultValue={get('fuel')}>
              <option value="">Tous</option>
              {Object.entries(fuelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Transmission" htmlFor="transmission">
            <Select id="transmission" name="transmission" defaultValue={get('transmission')}>
              <option value="">Toutes</option>
              {Object.entries(transmissionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prix minimum" htmlFor="minPrice">
            <Input id="minPrice" name="minPrice" type="number" min={0} step={1000} defaultValue={get('minPrice')} placeholder="0" />
          </Field>

          <Field label="Prix maximum" htmlFor="maxPrice">
            <Input id="maxPrice" name="maxPrice" type="number" min={0} step={1000} defaultValue={get('maxPrice')} placeholder="Sans limite" />
          </Field>

          <Field label="Annee minimum" htmlFor="minYear">
            <Select id="minYear" name="minYear" defaultValue={get('minYear')}>
              <option value="">Indifferent</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Annee maximum" htmlFor="maxYear">
            <Select id="maxYear" name="maxYear" defaultValue={get('maxYear')}>
              <option value="">Indifferent</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} className="flex-1 sm:flex-none">
          {compact ? 'Trouver un vehicule' : 'Appliquer'}
        </Button>

        {!compact && (
          <Button type="button" variant="secondary" size="md" onClick={() => setOpenAdvanced((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" />
            {openAdvanced ? 'Masquer les filtres' : 'Filtres avances'}
          </Button>
        )}

        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="md" onClick={reset}>
            <X className="h-4 w-4" />
            Effacer ({activeCount})
          </Button>
        )}
      </div>
    </form>
  )
}
