'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent/90 shadow-soft',
  secondary: 'bg-white text-ink border border-line hover:border-ink/30 hover:bg-surface',
  ghost: 'text-ink hover:bg-surface',
  danger: 'bg-danger text-white hover:bg-danger/90',
  gold: 'bg-gold text-white hover:bg-gold/90 shadow-soft',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }

export function ButtonLink({ className, variant = 'primary', size = 'md', ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
