'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/modal'
import { deleteVehicle, duplicateVehicle, togglePublish } from '@/server/actions/vehicle'

export function VehicleRowActions({
  id,
  published,
  label,
}: {
  id: string
  published: boolean
  label: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (result.ok) {
        toast.success(result.message ?? 'Effectue.')
        router.refresh()
      } else {
        toast.error(result.message ?? 'Action impossible.')
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/vehicules/${id}`}
        aria-label={`Modifier ${label}`}
        className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => togglePublish(id, !published))}
        aria-label={published ? `Masquer ${label}` : `Publier ${label}`}
        className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink"
      >
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => duplicateVehicle(id))}
        aria-label={`Dupliquer ${label}`}
        className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink"
      >
        <Copy className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Supprimer ${label}`}
        className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          run(() => deleteVehicle(id))
        }}
        loading={pending}
        title={`Supprimer ${label} ?`}
        description="La fiche et ses photos sont effacées définitivement. Une commande existante bloque la suppression pour préserver l’historique."
      />
    </div>
  )
}
