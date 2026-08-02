import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      vehicle: { select: { brand: true, model: true, reference: true } },
    },
  })

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
      r.startDate.toISOString().slice(0, 10),
      r.endDate.toISOString().slice(0, 10),
      r.days,
      r.pickupPlace,
      r.returnPlace,
      Number(r.totalPrice),
      r.createdAt.toISOString().slice(0, 16).replace('T', ' '),
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
