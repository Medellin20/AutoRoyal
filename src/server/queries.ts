import 'server-only'
import { getSupabaseAdmin, getSupabasePublic, throwSupabaseError } from '@/lib/supabase'
import { getPublicVehiclesWithImages } from '@/server/vehicle-data'
import type { Vehicle, VehicleFilters, VehicleImage, VehicleWithImages } from '@/types'

export const PAGE_SIZE = 9

function searchTerm(value: string) {
  return value.trim().replace(/[(),*]/g, ' ').replace(/\s+/g, ' ')
}

export async function getVehicles(filters: VehicleFilters) {
  const page = Math.max(1, Number(filters.page ?? 1) || 1)
  const client = getSupabasePublic()
  let query = client.from('vehicles').select('*', { count: 'exact' }).eq('published', true).in('offerType', ['SALE', 'BOTH'])

  if (filters.q) {
    const q = searchTerm(filters.q)
    if (q) query = query.or(`brand.ilike.%${q}%,model.ilike.%${q}%,version.ilike.%${q}%,reference.ilike.%${q}%`)
  }
  if (filters.brand) query = query.ilike('brand', filters.brand)
  if (filters.model) query = query.ilike('model', `%${filters.model}%`)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.fuel) query = query.eq('fuel', filters.fuel)
  if (filters.transmission) query = query.eq('transmission', filters.transmission)
  if (filters.minYear) query = query.gte('year', Number(filters.minYear))
  if (filters.maxYear) query = query.lte('year', Number(filters.maxYear))

  const min = filters.minPrice ? Number(filters.minPrice) : undefined
  const max = filters.maxPrice ? Number(filters.maxPrice) : undefined
  if (min !== undefined || max !== undefined) {
    const fields = ['salePrice']
    const clauses = fields.map((field) => {
      const terms = [min !== undefined ? `${field}.gte.${min}` : '', max !== undefined ? `${field}.lte.${max}` : ''].filter(Boolean)
      return terms.length > 1 ? `and(${terms.join(',')})` : terms[0]
    })
    query = fields.length === 1
      ? (min !== undefined ? query.gte(fields[0], min) : query).lte(fields[0], max ?? Number.MAX_SAFE_INTEGER)
      : query.or(clauses.join(','))
  }

  const sortField = filters.sort === 'price-asc' || filters.sort === 'price-desc'
    ? 'salePrice'
    : filters.sort === 'year-asc' || filters.sort === 'year-desc'
      ? 'year'
      : filters.sort === 'popular' ? 'views' : 'createdAt'
  const ascending = filters.sort === 'price-asc' || filters.sort === 'year-asc'
  const { data, error, count } = await query
    .order('featured', { ascending: false })
    .order(sortField, { ascending, nullsFirst: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  throwSupabaseError(error)
  const items = await getPublicVehiclesWithImages((data ?? []) as Vehicle[])
  const total = count ?? 0
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export async function getFeaturedVehicles(take = 6) {
  try {
    const client = getSupabasePublic()
    const { data, error } = await client.from('vehicles').select('*').eq('published', true)
      .in('status', ['AVAILABLE', 'RESERVED']).in('offerType', ['SALE', 'BOTH']).order('featured', { ascending: false })
      .order('createdAt', { ascending: false }).limit(take)
    throwSupabaseError(error)
    return await getPublicVehiclesWithImages((data ?? []) as Vehicle[])
  } catch (error) {
    console.warn('Could not fetch featured vehicles:', (error as Error).message)
    return []
  }
}

export async function getVehicleBySlug(slug: string) {
  const client = getSupabasePublic()
  const { data, error } = await client.from('vehicles').select('*').eq('slug', slug).eq('published', true).in('offerType', ['SALE', 'BOTH']).maybeSingle()
  throwSupabaseError(error)
  if (!data) return null
  const [vehicle] = await getPublicVehiclesWithImages([data as Vehicle])
  return vehicle as VehicleWithImages
}

export async function getSimilarVehicles(vehicleId: string, category: string, take = 3) {
  const client = getSupabasePublic()
  const { data, error } = await client.from('vehicles').select('*').eq('published', true).in('offerType', ['SALE', 'BOTH']).eq('category', category).neq('id', vehicleId)
    .order('featured', { ascending: false }).limit(take)
  throwSupabaseError(error)
  return getPublicVehiclesWithImages((data ?? []) as Vehicle[])
}

export async function getFilterOptions() {
  try {
    const { data, error } = await getSupabasePublic().from('vehicles').select('brand,model,year').eq('published', true).in('offerType', ['SALE', 'BOTH']).order('brand')
    throwSupabaseError(error)
    const rows = data ?? []
    return {
      brands: Array.from(new Set(rows.map((row) => row.brand))).sort(),
      models: Array.from(new Set(rows.map((row) => row.model))).sort(),
      years: Array.from(new Set(rows.map((row) => row.year))).sort((a, b) => b - a),
    }
  } catch (error) {
    console.warn('Could not fetch filter options:', (error as Error).message)
    return { brands: [], models: [], years: [] }
  }
}

export async function getRentableVehicles() {
  const { data, error } = await getSupabasePublic().from('vehicles')
    .select('id,brand,model,year,dailyPrice,deposit').eq('published', true).in('offerType', ['RENT', 'BOTH']).eq('status', 'AVAILABLE').order('brand')
  throwSupabaseError(error)
  return data ?? []
}

export async function getSellableVehicles() {
  const { data, error } = await getSupabasePublic().from('vehicles')
    .select('id,brand,model,year,reference,salePrice,currency,title,quantity').eq('published', true).in('offerType', ['SALE', 'BOTH']).eq('status', 'AVAILABLE').gt('quantity', 0).order('brand')
  throwSupabaseError(error)
  return data ?? []
}

export async function getDashboardStats() {
  const db = getSupabaseAdmin()
  const count = async (table: string, status?: string) => {
    let query = db.from(table).select('id', { count: 'exact', head: true })
    if (status) query = query.eq('status', status)
    if (table === 'vehicles') query = query.in('offerType', ['SALE', 'BOTH'])
    const result = await query
    throwSupabaseError(result.error)
    return result.count ?? 0
  }
  const sixMonthsAgo = new Date(Date.now() - 180 * 86_400_000).toISOString()
  const [totalVehicles, available, sold, pendingOrders, confirmedOrders, ordersResult, revenueResult, viewedResult] = await Promise.all([
    count('vehicles'), count('vehicles', 'AVAILABLE'), count('vehicles', 'SOLD'),
    count('sales_orders', 'PENDING_PAYMENT'), count('sales_orders', 'PAYMENT_CONFIRMED'),
    db.from('sales_orders').select('*').order('createdAt', { ascending: false }).limit(5),
    db.from('sales_orders').select('createdAt,totalAmount').eq('paymentStatus', 'CONFIRMED').gte('createdAt', sixMonthsAgo),
    db.from('vehicles').select('id,brand,model,views,slug').in('offerType', ['SALE', 'BOTH']).order('views', { ascending: false }).limit(5),
  ])
  throwSupabaseError(ordersResult.error)
  throwSupabaseError(revenueResult.error)
  throwSupabaseError(viewedResult.error)

  const orders = ordersResult.data ?? []
  const customerIds = Array.from(new Set(orders.map((row) => row.customerId)))
  const customersResult = customerIds.length
    ? await db.from('customers').select('*').in('id', customerIds)
    : { data: [], error: null }
  throwSupabaseError(customersResult.error)
  const customers = new Map((customersResult.data ?? []).map((row) => [row.id, row]))
  const recentOrders = orders.map((row) => ({ ...row, customer: customers.get(row.customerId) }))

  const months = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i, 1)
    months.set(d.toLocaleDateString('fr-FR', { month: 'short' }), 0)
  }
  let revenue = 0
  for (const row of revenueResult.data ?? []) {
    const key = new Date(row.createdAt).toLocaleDateString('fr-FR', { month: 'short' })
    const amount = Number(row.totalAmount)
    if (months.has(key)) months.set(key, (months.get(key) ?? 0) + amount)
    revenue += amount
  }

  return {
    totalVehicles, available, sold, pendingOrders, confirmedOrders,
    revenue, recentOrders, mostViewed: viewedResult.data ?? [],
    chart: Array.from(months, ([month, total]) => ({ month, total })),
  }
}
