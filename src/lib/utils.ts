import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { siteConfig } from '@/config/site'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formate un montant dans la devise du garage. */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Sur demande'
  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) return 'Sur demande'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Genere un slug URL a partir d'un texte libre. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Nombre de jours factures entre deux dates (minimum 1). */
export function diffInDays(start: Date | string, end: Date | string): number {
  const s = new Date(start).setHours(0, 0, 0, 0)
  const e = new Date(end).setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((e - s) / 86_400_000))
}

/** Genere une reference lisible : RES-20250412-4F7A */
export function makeReference(prefix: string): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${stamp}-${rand}`
}

export function truncate(text: string, length = 140): string {
  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text
}

/** Convertit une valeur Prisma Decimal en number utilisable cote client. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export const WHATSAPP_BASE = 'https://wa.me'

export function whatsappLink(message: string): string {
  return `${WHATSAPP_BASE}/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`
}
