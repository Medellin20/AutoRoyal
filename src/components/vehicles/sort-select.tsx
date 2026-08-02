'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/field'

const options = [
  { value: 'recent', label: 'Plus recents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
  { value: 'year-desc', label: 'Annee : recente' },
  { value: 'year-asc', label: 'Annee : ancienne' },
  { value: 'popular', label: 'Les plus consultes' },
]

export function SortSelect() {
  const router = useRouter()
  const params = useSearchParams()

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString())
    next.set('sort', value)
    next.delete('page')
    router.push(`/vehicules?${next.toString()}`)
  }

  return (
    <Select
      aria-label="Trier les resultats"
      defaultValue={params.get('sort') ?? 'recent'}
      onChange={(e) => onChange(e.target.value)}
      className="w-auto min-w-[200px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  )
}
