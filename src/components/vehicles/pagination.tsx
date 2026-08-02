'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const params = useSearchParams()
  if (pages <= 1) return null

  const href = (p: number) => {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(p))
    return `/vehicules?${next.toString()}`
  }

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  )

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-label="Page precedente"
        aria-disabled={page === 1}
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full border border-line',
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:border-accent hover:text-accent',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {numbers.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - numbers[i - 1] > 1 && <span className="px-1 text-muted">...</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full border text-sm transition-colors',
              p === page
                ? 'border-accent bg-accent text-white'
                : 'border-line hover:border-accent hover:text-accent',
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={href(Math.min(pages, page + 1))}
        aria-label="Page suivante"
        aria-disabled={page === pages}
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full border border-line',
          page === pages ? 'pointer-events-none opacity-40' : 'hover:border-accent hover:text-accent',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
