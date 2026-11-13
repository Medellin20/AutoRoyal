import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Customer, Reservation, Vehicle } from '@/types/database'
import { can } from '@/lib/permissions'
import { reservationStatusLabels } from '@/lib/labels'

/** Echappe une valeur pour le format CSV. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

/** Export CSV des reservations, reserve aux administrateurs. */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Authentification requise.' }, { status: 401 })
  }
  if (!can(session.user.role, 'reservation:export')) {
    return NextResponse.json({ message: 'Votre role ne permet pas l export.' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  const [reservationResult, customerResult, vehicleResult] = await Promise.all([
    db.from('reservations').select('*').order('createdAt', { ascending: false }),
    db.from('customers').select('*'),
    db.from('vehicles').select('id,brand,model,reference'),
  ])
  if (reservationResult.error || customerResult.error || vehicleResult.error) {
    return NextResponse.json({ message: 'Export indisponible.' }, { status: 500 })
  }
  const customers = new Map(((customerResult.data ?? []) as Customer[]).map((row) => [row.id, row]))
  const vehicles = new Map(((vehicleResult.data ?? []) as Vehicle[]).map((row) => [row.id, row]))
  const reservations = (reservationResult.data ?? []).map((row) => ({
    ...row, customer: customers.get(row.customerId), vehicle: vehicles.get(row.vehicleId),
  })).filter((row) => row.customer && row.vehicle) as (Reservation & { customer: Customer; vehicle: Vehicle })[]

  const header = [
    'Reference', 'Statut', 'Vehicule', 'Ref. vehicule', 'Client', 'Telephone', 'E-mail',
    'Debut', 'Fin', 'Jours', 'Retrait', 'Retour', 'Total', 'Cree le',
  ]

  const rows = reservations.map((r) =>
    [
      r.reference,
      reservationStatusLabels[r.status],
      `${r.vehicle.brand} ${r.vehicle.model}`,
      r.vehicle.reference,
      r.customer.fullName,
      r.customer.phone,
      r.customer.email,
      new Date(r.startDate).toISOString().slice(0, 10),
      new Date(r.endDate).toISOString().slice(0, 10),
      r.days,
      r.pickupPlace,
      r.returnPlace,
      Number(r.totalPrice),
      new Date(r.createdAt).toISOString().slice(0, 16).replace('T', ' '),
    ].map(csvCell).join(';'),
  )

  // BOM UTF-8 pour un affichage correct dans Excel.
  const csv = `\uFEFF${header.map(csvCell).join(';')}\n${rows.join('\n')}`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
