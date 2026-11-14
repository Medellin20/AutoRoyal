import Link from 'next/link'
import { Eye, Plus } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { getDashboardStats } from '@/server/queries'
import { formatPrice, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Vehicules au parc', value: stats.totalVehicles, icon: 'car' as const, tone: 'accent' as const },
    { label: 'Disponibles', value: stats.available, icon: 'check' as const, tone: 'success' as const },
    { label: 'Vendus', value: stats.sold, icon: 'car' as const, tone: 'gold' as const },
    { label: 'Commandes à payer', value: stats.pendingOrders, icon: 'shopping' as const, tone: 'warning' as const },
    { label: 'Paiements vérifiés', value: stats.confirmedOrders, icon: 'check' as const, tone: 'success' as const },
    { label: 'Ventes confirmées', value: formatPrice(stats.revenue), icon: 'banknote' as const, tone: 'gold' as const },
  ]

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Véhicules en vente, commandes récentes et paiements vérifiés."
        action={(
          <ButtonLink href="/admin/vehicules/nouveau">
            <Plus className="h-4 w-4" />
            Ajouter un véhicule
          </ButtonLink>
        )}
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
          <h2 className="font-display text-lg font-semibold">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm text-accent">
            Toutes les commandes
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Aucune commande pour le moment. Les nouvelles commandes apparaîtront ici.
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
                {stats.recentOrders.map((p) => {
                  const vehicle = p.vehicleSnapshot as Record<string, unknown>
                  const status = p.paymentStatus === 'CONFIRMED' ? 'success' : p.paymentStatus === 'REJECTED' ? 'danger' : 'warning'
                  const label = p.paymentStatus === 'CONFIRMED' ? 'Paiement vérifié' : p.paymentStatus === 'REJECTED' ? 'Paiement refusé' : 'En attente'
                  return (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-medium">{p.reference}</td>
                      <td className="py-3 pr-4">{p.customer?.fullName ?? 'Client'}</td>
                      <td className="py-3 pr-4 text-muted">{String(vehicle.brand)} {String(vehicle.model)}</td>
                      <td className="py-3 pr-4 text-muted">{formatDate(p.createdAt)}</td>
                      <td className="py-3"><Badge tone={status}>{label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
