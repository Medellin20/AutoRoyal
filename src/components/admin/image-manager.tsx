'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/modal'
import { removeImage, reorderImages, setMainImage } from '@/server/actions/vehicle'
import type { VehicleImage } from '@/types/database'

export function ImageManager({
  vehicleId,
  images,
}: {
  vehicleId: string
  images: VehicleImage[]
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [toDelete, setToDelete] = useState<string | null>(null)

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    const formData = new FormData()
    formData.append('vehicleId', vehicleId)
    Array.from(files).forEach((file) => formData.append('files', file))

    setUploading(true)
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message ?? 'Televersement impossible.')
        return
      }
      toast.success(`${data.images.length} image(s) ajoutee(s).`)
      router.refresh()
    } catch {
      toast.error('Reseau indisponible. Reessayez.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]

    startTransition(async () => {
      const result = await reorderImages(vehicleId, next.map((i) => i.id))
      if (result.ok) router.refresh()
      else toast.error(result.message)
    })
  }

  function makeMain(id: string) {
    startTransition(async () => {
      const result = await setMainImage(id)
      if (result.ok) {
        toast.success(result.message ?? '')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  function confirmDelete() {
    if (!toDelete) return
    startTransition(async () => {
      const result = await removeImage(toDelete)
      setToDelete(null)
      if (result.ok) {
        toast.success(result.message ?? '')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Photos</h2>
          <p className="mt-1 text-sm text-muted">
            JPEG, PNG, WebP ou AVIF. 5 Mo maximum par fichier. La premiere image sert de vignette.
          </p>
        </div>

        <Button type="button" onClick={() => inputRef.current?.click()} loading={uploading}>
          <Upload className="h-4 w-4" />
          Ajouter des photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Aucune photo. Une fiche sans photo ne peut pas etre publiee correctement.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-line">
              <div className="relative aspect-[4/3] bg-surface">
                <Image src={image.url} alt={image.alt} fill sizes="240px" className="object-cover" />
                {image.isMain && (
                  <span className="absolute left-2 top-2 rounded-pill bg-white/95 px-2 py-1 text-xs font-medium text-accent">
                    Principale
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pending}
                    aria-label="Deplacer avant"
                    className="rounded-lg p-1.5 text-muted hover:bg-surface disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1 || pending}
                    aria-label="Deplacer apres"
                    className="rounded-lg p-1.5 text-muted hover:bg-surface disabled:opacity-30"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => makeMain(image.id)}
                    disabled={image.isMain || pending}
                    aria-label="Definir comme image principale"
                    className="rounded-lg p-1.5 text-muted hover:bg-surface disabled:opacity-30"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(image.id)}
                    aria-label="Supprimer l image"
                    className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={pending}
        title="Supprimer cette photo ?"
        description="La photo est retiree de la fiche et effacee du stockage. Cette action est definitive."
      />
    </section>
  )
}
