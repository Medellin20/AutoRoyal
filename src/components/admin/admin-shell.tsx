'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck, Car, LayoutDashboard, LogOut, Menu, Settings, ShoppingBag, Users, X,
} from 'lucide-react'
import { adminNav } from '@/config/nav'
import { roleLabels } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import type { Role } from '@/types/database'

const icons = { LayoutDashboard, Car, CalendarCheck, ShoppingBag, Users, Settings }

type Props = {
  user: { name?: string | null; email?: string | null; role: Role }
  children: React.ReactNode
}

export function AdminShell({ user, children }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = (
    <ul className="space-y-1">
      {adminNav.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons]
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                active ? 'bg-accent-soft font-medium text-accent' : 'text-ink/75 hover:bg-surface',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Navigation administration">
          {links}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{roleLabels[user.role]}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/75 transition-colors hover:bg-surface"
          >
            <LogOut className="h-4 w-4" />
            Se deconnecter
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-5 py-3.5 lg:hidden">
        <Logo compact />
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-full p-2 hover:bg-surface"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/25"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white"
              aria-label="Navigation administration"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <Logo />
                <button onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-full p-2 hover:bg-surface">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{links}</div>
              <div className="border-t border-line p-4">
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Se deconnecter
                </button>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
