'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/field'
import { useDebounce } from '@/hooks/use-debounce'

/** Recherche instantanee, synchronisee avec l URL. */
export function SearchInput({ placeholder = 'Rechercher' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')
  const debounced = useDebounce(value)

  useEffect(() => {
    const next = new URLSearchParams(params.toString())
    if (debounced) next.set('q', debounced)
    else next.delete('q')
    router.replace(`${pathname}?${next.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-10"
      />
    </div>
  )
}
