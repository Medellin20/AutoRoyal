import { getSupabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { PaymentReview } from '@/components/admin/payment-review'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatPrice } from '@/lib/utils'
import type { Customer, SalesOrder } from '@/types/database'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Commandes' }

export default async function AdminOrdersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth()
  const canReviewPayments = can(session?.user.role, 'payment:verify')
  const db = getSupabaseAdmin()
  const [ordersResult, customersResult, noticesResult] = await Promise.all([
    db.from('sales_orders').select('*').order('createdAt', { ascending: false }),
    db.from('customers').select('*'),
    db.from('sales_order_notifications').select('*').order('createdAt', { ascending: false }),
  ])
  if (ordersResult.error || customersResult.error || noticesResult.error) throw new Error('Lecture des commandes impossible.')

  const customers = new Map(((customersResult.data ?? []) as Customer[]).map((customer) => [customer.id, customer]))
  const notices = new Map<string, Record<string, unknown>>()
  for (const notice of noticesResult.data ?? []) if (!notices.has(notice.orderId)) notices.set(notice.orderId, notice)
  const query = searchParams.q?.trim().toLowerCase()
  const orders = ((ordersResult.data ?? []) as SalesOrder[])
    .map((order) => ({ order, customer: customers.get(order.customerId), notice: notices.get(order.id) }))
    .filter(({ customer }) => Boolean(customer))
    .filter(({ order, customer }) => !query || [order.reference, customer!.fullName, customer!.email, customer!.phone].some((value) => value.toLowerCase().includes(query)))

  return (
    <>
      <PageHeader title="Commandes" description={`${orders.length} commande(s) de véhicules accidentés.`} />
      <div className="mb-5"><SearchInput placeholder="Référence, client, e-mail ou téléphone" /></div>
      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
          <h2 className="font-display text-lg font-semibold">Aucune commande</h2>
          <p className="mt-2 text-sm text-muted">Les commandes créées depuis le catalogue s’afficheront ici.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
          <table className="w-full min-w-[1100px] text-sm">
            <thead><tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Commande</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Véhicule</th>
              <th className="px-5 py-3">Montant</th><th className="px-5 py-3">Créée le</th><th className="px-5 py-3">Paiement</th><th className="px-5 py-3">Alerte e-mail</th><th className="px-5 py-3">Vérification</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {orders.map(({ order, customer, notice }) => {
                const vehicle = order.vehicleSnapshot
                const statusLabel = order.paymentStatus === 'CONFIRMED' ? 'Confirmé' : order.paymentStatus === 'REJECTED' ? 'Refusé' : 'En attente'
                const statusTone = order.paymentStatus === 'CONFIRMED' ? 'success' : order.paymentStatus === 'REJECTED' ? 'danger' : 'warning'
                const noticeLabel = notice?.status === 'SENT' ? 'Envoyée' : notice?.status === 'FAILED' ? 'Échec' : notice?.status === 'PENDING' ? 'Envoi en cours' : 'À configurer'
                const noticeTone = notice?.status === 'SENT' ? 'success' : notice?.status === 'FAILED' ? 'danger' : notice?.status === 'PENDING' ? 'accent' : 'warning'
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-5 py-4"><p className="font-semibold">{order.reference}</p><p className="mt-1 text-xs text-muted">{order.status === 'CANCELLED' ? 'Annulée' : order.status === 'PAYMENT_CONFIRMED' ? 'Terminée' : 'À payer'}</p></td>
                    <td className="px-5 py-4"><p>{customer!.fullName}</p><a className="mt-1 block text-xs text-accent" href={`mailto:${customer!.email}`}>{customer!.email}</a><a className="text-xs text-muted" href={`tel:${customer!.phone}`}>{customer!.phone}</a></td>
                    <td className="px-5 py-4">{String(vehicle.title ?? `${vehicle.brand} ${vehicle.model}`)} ({String(vehicle.year)})<p className="mt-1 text-xs text-muted">Réf. {String(vehicle.reference)}</p></td>
                    <td className="px-5 py-4 font-medium">{formatPrice(order.totalAmount, String(vehicle.currency ?? 'EUR'))}</td>
                    <td className="px-5 py-4 text-muted">{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-4"><Badge tone={statusTone}>{statusLabel}</Badge>{order.paymentReference && <p className="mt-2 max-w-40 break-words text-xs text-muted">Réf. {order.paymentReference}</p>}</td>
                    <td className="px-5 py-4"><Badge tone={noticeTone}>{noticeLabel}</Badge>{Boolean(notice?.recipient) && <p className="mt-1 max-w-36 break-all text-xs text-muted">{String(notice?.recipient)}</p>}{Boolean(notice?.detail) && <p className="mt-1 max-w-44 text-xs text-muted">{String(notice?.detail)}</p>}</td>
                    <td className="px-5 py-4"><PaymentReview id={order.id} paymentStatus={order.paymentStatus} orderStatus={order.status} canReview={canReviewPayments} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
