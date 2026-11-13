'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Phone, Heart } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { mainNav } from '@/config/nav'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/button'
import { Logo } from './logo'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled ? 'border-line bg-white/90 backdrop-blur-md' : 'border-transparent bg-white',
      )}
    >
      <nav className="shell flex h-18 items-center justify-between py-3.5" aria-label="Navigation principale">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-pill px-3.5 py-2 text-sm transition-colors',
                    active ? 'text-accent' : 'text-ink/75 hover:text-ink',
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/favoris"
            aria-label="Mes favoris"
            className="rounded-full p-2.5 text-ink/70 transition-colors hover:bg-surface hover:text-ink"
          >
            <Heart className="h-5 w-5" />
          </Link>
          {siteConfig.contact.phone && (
            <a
              href={`tel:${String(siteConfig.contact.phone).replace(/\s/g, '')}`}
              className="flex items-center gap-2 rounded-pill px-3 py-2 text-sm text-ink/75 hover:text-ink"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.contact.phone}
            </a>
          )}
          <ButtonLink href="/vehicules" size="sm">
            Voir les vehicules
          </ButtonLink>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="rounded-full p-2.5 text-ink hover:bg-surface lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="shell flex flex-col py-4">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border-b border-line/60 py-3.5 text-[15px] text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 flex gap-3">
                <ButtonLink href="/vehicules" className="flex-1">
                  Voir les vehicules
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" className="flex-1">
                  Nous contacter
                </ButtonLink>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
