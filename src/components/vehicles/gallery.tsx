'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VehicleImage } from '@/types/database'

const PLACEHOLDER = '/images/placeholder-vehicle.svg'

export function Gallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const list = images.length > 0 ? images : null

  const next = () => setIndex((i) => (list ? (i + 1) % list.length : 0))
  const prev = () => setIndex((i) => (list ? (i - 1 + list.length) % list.length : 0))
  const current = list?.[index]

  return (
    <>
      <div className="space-y-3">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-card bg-surface">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? 'placeholder'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={current?.url ?? PLACEHOLDER}
                alt={current?.alt ?? title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => setZoom(true)}
            aria-label="Agrandir la photo"
            className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 text-ink shadow-soft transition-opacity"
          >
            <Expand className="h-4 w-4" />
          </button>

          {list && list.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Photo precedente"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 shadow-soft"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 shadow-soft"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-3 left-3 rounded-pill bg-white/95 px-3 py-1 text-xs font-medium shadow-soft">
                {index + 1} / {list.length}
              </span>
            </>
          )}
        </div>

        {list && list.length > 1 && (
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {list.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setIndex(i)}
                aria-label={`Voir la photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                  i === index ? 'border-accent' : 'border-transparent hover:border-line',
                )}
              >
                <Image src={img.url} alt={img.alt} fill sizes="112px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoom && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 p-4 backdrop-blur"
            onClick={() => setZoom(false)}
          >
            <button
              aria-label="Fermer"
              className="absolute right-5 top-5 rounded-full border border-line bg-white p-2.5 shadow-soft"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative h-[80vh] w-full max-w-5xl">
              <Image src={current.url} alt={current.alt} fill className="object-contain" sizes="100vw" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
