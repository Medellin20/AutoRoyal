import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '@/config/site'

/** Logo Laurent Crash Autos. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${siteConfig.name}, accueil`}>
      <Image
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={1272}
        height={530}
        priority
        className={compact ? 'h-auto w-[150px]' : 'h-auto w-[170px]'}
      />
    </Link>
  )
}
