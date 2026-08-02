import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { VehicleFilters } from '@/types'

export const PAGE_SIZE = 9

/** Construit la clause WHERE du catalogue a partir des filtres d'URL. */
export function buildVehicleWhere(filters: VehicleFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { published: true }

  if (filters.q) {
    where.OR = [
      { brand: { contains: filters.q, mode: 'insensitive' } },
      { model: { contains: filters.q, mode: 'insensitive' } },
      { version: { contains: filters.q, mode: 'insensitive' } },
      { reference: { contains: filters.q, mode: 'insensitive' } },
    ]
  }
  if (filters.brand) where.brand = { equals: filters.brand, mode: 'insensitive' }
  if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' }
  if (filters.category) where.category = filters.category as never
  if (filters.fuel) where.fuel = filters.fuel as never
  if (filters.transmission) where.transmission = filters.transmission as never

  if (filters.offerType === 'SALE') where.offerType = { in: ['SALE', 'BOTH'] }
  if (filters.offerType === 'RENT') where.offerType = { in: ['RENT', 'BOTH'] }

  if (filters.minYear || filters.maxYear) {
    where.year = {
      ...(filters.minYear ? { gte: Number(filters.minYear) } : {}),
      ...(filters.maxYear ? { lte: Number(filters.maxYear) } : {}),
    }
  }

  if (filters.minPrice || filters.maxPrice) {
    const range = {
      ...(filters.minPrice ? { gte: new Prisma.Decimal(filters.minPrice) } : {}),
      ...(filters.maxPrice ? { lte: new Prisma.Decimal(filters.maxPrice) } : {}),
    }
    // Le prix filtre depend du type d'offre choisi.
    if (filters.offerType === 'RENT') where.dailyPrice = range
    else if (filters.offerType === 'SALE') where.salePrice = range
    else where.AND = [{ OR: [{ salePrice: range }, { dailyPrice: range }] }]
  }

  return where
}

function buildOrderBy(sort?: string): Prisma.VehicleOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { salePrice: 'asc' }
    case 'price-desc':
      return { salePrice: 'desc' }
    case 'year-desc':
      return { year: 'desc' }
    case 'year-asc':
      return { year: 'asc' }
    case 'popular':
      return { views: 'desc' }
    default:
      return { createdAt: 'desc' }
  }
}

export async function getVehicles(filters: VehicleFilters) {
  const page = Math.max(1, Number(filters.page ?? 1))
  const where = buildVehicleWhere(filters)

  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ featured: 'desc' }, buildOrderBy(filters.sort)],
      include: { images: { orderBy: { position: 'asc' } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vehicle.count({ where }),
  ])

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export async function getFeaturedVehicles(take = 6) {
  try {
    return await prisma.vehicle.findMany({
      where: { published: true, status: { in: ['AVAILABLE', 'RESERVED'] } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { position: 'asc' } } },
      take,
    })
  } catch (e) {
    // If Prisma isn't configured during the build, return an empty list so
    // the homepage can still be prerendered without a DB connection.
    // eslint-disable-next-line no-console
    console.warn('Could not fetch featured vehicles:', (e as Error).message)
    return []
  }
}

export async function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { position: 'asc' } } },
  })
}

export async function getSimilarVehicles(vehicleId: string, category: string, take = 3) {
  return prisma.vehicle.findMany({
    where: { published: true, category: category as never, NOT: { id: vehicleId } },
    include: { images: { orderBy: { position: 'asc' } } },
    take,
  })
}

/** Marques et modeles disponibles pour alimenter les filtres. */
export async function getFilterOptions() {
  try {
    const rows = await prisma.vehicle.findMany({
      where: { published: true },
      select: { brand: true, model: true, year: true },
      orderBy: { brand: 'asc' },
    })

    const brands = Array.from(new Set(rows.map((r) => r.brand))).sort()
    const models = Array.from(new Set(rows.map((r) => r.model))).sort()
    const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => b - a)

    return { brands, models, years }
  } catch (e) {
    // If the DB is not reachable during build, return empty options so the
    // homepage can still be prerendered.
    // eslint-disable-next-line no-console
    console.warn('Could not fetch filter options:', (e as Error).message)
    return { brands: [], models: [], years: [] }
  }
}

/** Vehicules louables, pour le formulaire de reservation. */
export async function getRentableVehicles() {
  return prisma.vehicle.findMany({
    where: { published: true, offerType: { in: ['RENT', 'BOTH'] }, status: 'AVAILABLE' },
    select: { id: true, brand: true, model: true, year: true, dailyPrice: true, deposit: true },
    orderBy: { brand: 'asc' },
  })
}

export async function getSellableVehicles() {
  return prisma.vehicle.findMany({
    where: { published: true, offerType: { in: ['SALE', 'BOTH'] }, status: { not: 'SOLD' } },
    select: { id: true, brand: true, model: true, year: true, salePrice: true },
    orderBy: { brand: 'asc' },
  })
}

/** Statistiques du tableau de bord. */
export async function getDashboardStats() {
  const [
    totalVehicles,
    available,
    rented,
    sold,
    pendingReservations,
    confirmedReservations,
    revenueAgg,
    recentPurchases,
    mostViewed,
    monthly,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'RENTED' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['CONFIRMED', 'ONGOING', 'COMPLETED'] } },
    }),
    prisma.purchaseRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        vehicle: { select: { id: true, brand: true, model: true, reference: true, slug: true } },
      },
    }),
    prisma.vehicle.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, brand: true, model: true, views: true, slug: true },
    }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 180 * 86_400_000) } },
      select: { createdAt: true, totalPrice: true, status: true },
    }),
  ])

  // Agregation mensuelle du chiffre d'affaires sur 6 mois.
  const months = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i, 1)
    months.set(d.toLocaleDateString('fr-FR', { month: 'short' }), 0)
  }
  for (const r of monthly) {
    if (!['CONFIRMED', 'ONGOING', 'COMPLETED'].includes(r.status)) continue
    const key = r.createdAt.toLocaleDateString('fr-FR', { month: 'short' })
    if (months.has(key)) months.set(key, (months.get(key) ?? 0) + Number(r.totalPrice))
  }

  return {
    totalVehicles,
    available,
    rented,
    sold,
    pendingReservations,
    confirmedReservations,
    revenue: Number(revenueAgg._sum.totalPrice ?? 0),
    recentPurchases,
    mostViewed,
    chart: Array.from(months, ([month, total]) => ({ month, total })),
  }
}
