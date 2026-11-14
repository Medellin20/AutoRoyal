'use client'

import { motion } from 'framer-motion'
import { Banknote, Car, CheckCircle2, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  car: Car,
  check: CheckCircle2,
  shopping: ShoppingBag,
  banknote: Banknote,
} as const

export function StatCard({
  label,
  value,
  icon,
  hint,
  index = 0,
  tone = 'accent',
}: {
  label: string
  value: string | number
  icon: keyof typeof icons
  hint?: string
  index?: number
  tone?: 'accent' | 'success' | 'warning' | 'gold'
}) {
  const Icon = icons[icon]
  const tones = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    gold: 'bg-gold/10 text-gold',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-card border border-line bg-white p-5 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  )
}
