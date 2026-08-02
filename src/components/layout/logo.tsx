import Link from 'next/link'
import { siteConfig } from '@/config/site'

/** Marque du garage : monogramme + nom. Remplacer par une image si besoin. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name}, accueil`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-sm font-bold text-white">
        AR
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight">{siteConfig.name}</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted">
            Vente &amp; location
          </span>
        </span>
      )}
    </Link>
  )
}
