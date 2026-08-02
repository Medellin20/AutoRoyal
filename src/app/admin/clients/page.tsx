import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await auth()
  if (!can(session?.user.role, 'customer:read')) redirect('/admin')

  const customers = await prisma.customer.findMany({
    where: searchParams.q
      ? {
          OR: [
            { fullName: { contains: searchParams.q, mode: 'insensitive' } },
            { email: { contains: searchParams.q, mode: 'insensitive' } },
            { phone: { contains: searchParams.q } },
          ],
        }
      : {},
    include: { _count: { select: { reservations: true, purchaseRequests: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <PageHeader title="Clients" description={`${customers.length} fiche(s) client.`} />

      <div className="mb-5">
        <SearchInput placeholder="Nom, e-mail ou telephone" />
      </div>

      {customers.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
          <h2 className="font-display text-lg font-semibold">Aucun client enregistre</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Une fiche client est créée automatiquement a la premiere demande envoyee depuis le site.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-medium">Nom</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Adresse</th>
                <th className="px-5 py-3.5 font-medium">Reservations</th>
                <th className="px-5 py-3.5 font-medium">Demandes d achat</th>
                <th className="px-5 py-3.5 font-medium">Client depuis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-5 py-3 font-medium">{customer.fullName}</td>
                  <td className="px-5 py-3">
                    <a href={`tel:${customer.phone}`} className="block text-accent">
                      {customer.phone}
                    </a>
                    <a href={`mailto:${customer.email}`} className="block text-xs text-muted">
                      {customer.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-muted">{customer.address ?? '-'}</td>
                  <td className="px-5 py-3">{customer._count.reservations}</td>
                  <td className="px-5 py-3">{customer._count.purchaseRequests}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
