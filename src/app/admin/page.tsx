import Link from 'next/link'
import {
  Banknote, CalendarClock, Car, CheckCircle2, Eye, KeyRound, ShoppingBag, Wrench,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats } from '@/server/queries'
import { formatPrice, formatDate } from '@/lib/utils'
import { purchaseStatusLabels, purchaseStatusTone } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Vehicules au parc', value: stats.totalVehicles, icon: Car, tone: 'accent' as const },
    { label: 'Disponibles', value: stats.available, icon: CheckCircle2, tone: 'success' as const },
    { label: 'En location', value: stats.rented, icon: KeyRound, tone: 'accent' as const },
    { label: 'Vendus', value: stats.sold, icon: Wrench, tone: 'gold' as const },
    { label: 'Reservations en attente', value: stats.pendingReservations, icon: CalendarClock, tone: 'warning' as const },
    { label: 'Reservations confirmees', value: stats.confirmedReservations, icon: CheckCircle2, tone: 'success' as const },
    { label: 'Chiffre d affaires estime', value: formatPrice(stats.revenue), icon: Banknote, tone: 'gold' as const },
    { label: 'Demandes d achat recentes', value: stats.recentPurchases.length, icon: ShoppingBag, tone: 'accent' as const },
  ]

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Etat du parc, demandes en cours et revenus estimes."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RevenueChart data={stats.chart} />

        <div className="rounded-card border border-line bg-white p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Vehicules les plus consultes</h2>
          {stats.mostViewed.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Aucune consultation enregistree pour l instant.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {stats.mostViewed.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/vehicules/${v.slug}`} className="truncate hover:text-accent">
                    {v.brand} {v.model}
                  </Link>
                  <span className="flex shrink-0 items-center gap-1.5 text-muted">
                    <Eye className="h-3.5 w-3.5" />
                    {v.views}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-card border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Dernieres demandes d&apos;achat</h2>
          <Link href="/admin/demandes-achat" className="text-sm text-accent">
            Tout voir
          </Link>
        </div>

        {stats.recentPurchases.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Aucune demande pour le moment. Les nouvelles demandes apparaitront ici.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 pr-4 font-medium">Reference</th>
                  <th className="pb-3 pr-4 font-medium">Client</th>
                  <th className="pb-3 pr-4 font-medium">Vehicule</th>
                  <th className="pb-3 pr-4 font-medium">Recue le</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.recentPurchases.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-medium">{p.reference}</td>
                    <td className="py-3 pr-4">{p.customer.fullName}</td>
                    <td className="py-3 pr-4 text-muted">{p.vehicle.brand} {p.vehicle.model}</td>
                    <td className="py-3 pr-4 text-muted">{formatDate(p.createdAt)}</td>
                    <td className="py-3">
                      <Badge tone={purchaseStatusTone[p.status]}>{purchaseStatusLabels[p.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
