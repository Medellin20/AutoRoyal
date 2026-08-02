'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/field'

/** Note interne, visible uniquement par l equipe. */
export function NoteEditor({
  id,
  note,
  action,
}: {
  id: string
  note: string | null
  action: (id: string, note: string) => Promise<{ ok: boolean; message?: string }>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(note ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await action(id, value)
      if (result.ok) {
        toast.success(result.message ?? 'Note enregistree.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.message ?? 'Enregistrement impossible.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Note interne"
        className={`rounded-lg p-2 hover:bg-surface ${note ? 'text-accent' : 'text-muted'}`}
      >
        <StickyNote className="h-4 w-4" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Note interne"
        description="Visible uniquement dans l administration."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save} loading={pending}>
              Enregistrer la note
            </Button>
          </>
        }
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="Rappel, accord commercial, point de vigilance..."
          aria-label="Note interne"
        />
      </Modal>
    </>
  )
}
