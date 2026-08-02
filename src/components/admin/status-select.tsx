'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Select } from '@/components/ui/field'

/** Selecteur de statut generique, relie a une server action. */
export function StatusSelect({
  id,
  value,
  options,
  action,
  ariaLabel,
}: {
  id: string
  value: string
  options: Record<string, string>
  action: (id: string, status: string) => Promise<{ ok: boolean; message?: string }>
  ariaLabel: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Select
      aria-label={ariaLabel}
      defaultValue={value}
      disabled={pending}
      className="h-9 w-auto min-w-[150px] py-1.5 text-xs"
      onChange={(e) => {
        const next = e.target.value
        startTransition(async () => {
          const result = await action(id, next)
          if (result.ok) {
            toast.success(result.message ?? 'Statut mis a jour.')
            router.refresh()
          } else {
            toast.error(result.message ?? 'Action impossible.')
          }
        })
      }}
    >
      {Object.entries(options).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  )
}
