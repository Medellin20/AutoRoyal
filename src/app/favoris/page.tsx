import type { Metadata } from 'next'
import { getSupabasePublic } from '@/lib/supabase'
import type { Vehicle } from '@/types/database'
import { getPublicVehiclesWithImages } from '@/server/vehicle-data'
import { PublicShell } from '@/components/layout/public-shell'
import { FavoritesGrid } from '@/components/vehicles/favorites-grid'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Mes favoris',
  description: 'Retrouvez les vehicules que vous avez mis de cote.',
  path: '/favoris',
})

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  // Les favoris sont stockes dans le navigateur : on charge le catalogue publie
  // et le filtrage se fait cote client.
  const { data, error } = await getSupabasePublic().from('vehicles').select('*').eq('published', true).order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  const vehicles = await getPublicVehiclesWithImages((data ?? []) as Vehicle[])

  return (
    <PublicShell>
      <section className="border-b border-line bg-surface py-12">
        <div className="shell">
          <p className="eyebrow">Selection</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 font-display text-4xl font-semibold">Mes favoris</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Les vehicules que vous mettez de cote restent enregistres sur cet appareil.
          </p>
        </div>
      </section>

      <section className="shell py-12">
        <FavoritesGrid vehicles={vehicles} />
      </section>
    </PublicShell>
  )
}
