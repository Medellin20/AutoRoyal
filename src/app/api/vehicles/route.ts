import { NextResponse } from 'next/server'
import { getVehicles } from '@/server/queries'
import type { VehicleFilters } from '@/types'

/** Catalogue filtre en JSON, utile pour un chargement progressif cote client. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = Object.fromEntries(searchParams) as VehicleFilters

  const { items, total, page, pages } = await getVehicles(filters)

  return NextResponse.json(
    {
      total,
      page,
      pages,
      items: items.map((v) => ({
        id: v.id,
        slug: v.slug,
        brand: v.brand,
        model: v.model,
        year: v.year,
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        dailyPrice: v.dailyPrice ? Number(v.dailyPrice) : null,
        mileage: v.mileage,
        fuel: v.fuel,
        transmission: v.transmission,
        status: v.status,
        image: v.images.find((i) => i.isMain)?.url ?? v.images[0]?.url ?? null,
      })),
    },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
  )
}
