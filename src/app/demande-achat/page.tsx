import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/public-shell'
import { PurchaseForm } from '@/components/forms/purchase-form'
import { EmptyState } from '@/components/vehicles/empty-state'
import { getSellableVehicles } from '@/server/queries'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: "Demande d'achat",
  description: "Indiquez le vehicule qui vous interesse, votre budget et vos preferences de paiement.",
  path: '/demande-achat',
})

export const dynamic = 'force-dynamic'

export default async function PurchasePage({
  searchParams,
}: {
  searchParams: { vehicule?: string }
}) {
  const vehicles = await getSellableVehicles()

  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Vente</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Demande d&apos;achat</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Un conseiller vous rappelle sous 24 h avec la fiche technique complete, l&apos;historique
            d&apos;entretien et les options de financement.
          </p>
        </div>
      </section>

      <section className="shell max-w-3xl py-12">
        {vehicles.length === 0 ? (
          <EmptyState
            title="Aucun vehicule a la vente actuellement"
            description="Le stock se renouvelle chaque semaine. Dites-nous ce que vous cherchez, nous vous alertons."
            actionHref="/contact"
            actionLabel="Decrire ma recherche"
          />
        ) : (
          <PurchaseForm vehicles={vehicles} defaultVehicleId={searchParams.vehicule} />
        )}
      </section>
    </PublicShell>
  )
}
