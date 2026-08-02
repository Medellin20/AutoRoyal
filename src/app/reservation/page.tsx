import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/public-shell'
import { ReservationForm } from '@/components/forms/reservation-form'
import { EmptyState } from '@/components/vehicles/empty-state'
import { getRentableVehicles } from '@/server/queries'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Reserver un vehicule',
  description: 'Choisissez vos dates, le lieu de retrait et recevez le total avant validation.',
  path: '/reservation',
})

export const dynamic = 'force-dynamic'

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: { vehicule?: string }
}) {
  const vehicles = await getRentableVehicles()

  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Location</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Reserver un vehicule</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Le total s&apos;affiche avant l&apos;envoi. Aucun paiement en ligne : vous reglez a la remise des cles.
          </p>
        </div>
      </section>

      <section className="shell py-12">
        {vehicles.length === 0 ? (
          <EmptyState
            title="Aucun vehicule libre pour le moment"
            description="Tous nos vehicules de location sont sortis. Ecrivez-nous, nous vous prevenons des le premier retour."
            actionHref="/contact"
            actionLabel="Etre prevenu"
          />
        ) : (
          <ReservationForm vehicles={vehicles} defaultVehicleId={searchParams.vehicule} />
        )}
      </section>
    </PublicShell>
  )
}
