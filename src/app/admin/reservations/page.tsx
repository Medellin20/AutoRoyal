import Link from 'next/link'
import { Download } from 'lucide-react'
import { getSupabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { StatusSelect } from '@/components/admin/status-select'
import { NoteEditor } from '@/components/admin/note-editor'
import { ButtonLink } from '@/components/ui/button'
import { addReservationNote, updateReservationStatus } from '@/server/actions/reservation'
import { formatDate, formatPrice } from '@/lib/utils'
import { reservationStatusLabels } from '@/lib/labels'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import type { Customer, Reservation, Vehicle } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const session = await auth()
  const canExport = can(session?.user.role, 'reservation:export')

  const db = getSupabaseAdmin()
  const [reservationsResult, customersResult, vehiclesResult] = await Promise.all([
    db.from('reservations').select('*').order('createdAt', { ascending: false }),
    db.from('customers').select('*'),
    db.from('vehicles').select('id,brand,model,slug'),
  ])
  if (reservationsResult.error || customersResult.error || vehiclesResult.error) throw new Error('Lecture des reservations impossible.')
  const customerMap = new Map(((customersResult.data ?? []) as Customer[]).map((row) => [row.id, row]))
  const vehicleMap = new Map(((vehiclesResult.data ?? []) as Vehicle[]).map((row) => [row.id, row]))
  const search = searchParams.q?.toLowerCase()
  const reservations = ((reservationsResult.data ?? []) as Reservation[])
    .filter((row) => !searchParams.status || row.status === searchParams.status)
    .flatMap((row) => {
      const customer = customerMap.get(row.customerId)
      const vehicle = vehicleMap.get(row.vehicleId)
      return customer && vehicle ? [{ ...row, customer, vehicle }] : []
    })
    .filter((row) => !search || [row.reference, row.customer.fullName, row.customer.phone, row.vehicle.brand, row.vehicle.model].some((value) => value.toLowerCase().includes(search)))

  const filters = [
    { label: 'Toutes', value: '' },
    ...Object.entries(reservationStatusLabels).map(([value, label]) => ({ label, value })),
  ]

  return (
    <>
      <PageHeader
        title="Reservations"
        description={`${reservations.length} demande(s).`}
        action={
          canExport ? (
            <ButtonLink href="/api/export" variant="secondary">
              <Download className="h-4 w-4" />
              Exporter en CSV
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Reference, client ou vehicule" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {filters.map((filter) => {
            const active = (searchParams.status ?? '') === filter.value
            const query = new URLSearchParams({
              ...(searchParams.q ? { q: searchParams.q } : {}),
              ...(filter.value ? { status: filter.value } : {}),
            })
            return (
              <Link
                key={filter.label}
                href={`/admin/reservations?${query.toString()}`}
                className={`whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-xs transition-colors ${
                  active ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent'
                }`}
              >
                {filter.label}
              </Link>
            )
          })}
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
          <h2 className="font-display text-lg font-semibold">Aucune reservation</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Les demandes envoyees depuis le site apparaitront ici, avec les coordonnees du client.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-medium">Reference</th>
                <th className="px-5 py-3.5 font-medium">Client</th>
                <th className="px-5 py-3.5 font-medium">Vehicule</th>
                <th className="px-5 py-3.5 font-medium">Periode</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Statut</th>
                <th className="px-5 py-3.5 text-right font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium">{r.reference}</td>
                  <td className="px-5 py-3">
                    <p>{r.customer.fullName}</p>
                    <a href={`tel:${r.customer.phone}`} className="text-xs text-accent">
                      {r.customer.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {r.vehicle.brand} {r.vehicle.model}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {formatDate(r.startDate)} au {formatDate(r.endDate)}
                    <span className="block text-xs">{r.days} jour(s)</span>
                  </td>
                  <td className="px-5 py-3">{formatPrice(r.totalPrice as never)}</td>
                  <td className="px-5 py-3">
                    <StatusSelect
                      id={r.id}
                      value={r.status}
                      options={reservationStatusLabels}
                      action={updateReservationStatus}
                      ariaLabel={`Statut de la reservation ${r.reference}`}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <NoteEditor id={r.id} note={r.internalNote} action={addReservationNote} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
