import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { StatusSelect } from '@/components/admin/status-select'
import { NoteEditor } from '@/components/admin/note-editor'
import { Badge } from '@/components/ui/badge'
import { addPurchaseNote, updatePurchaseStatus } from '@/server/actions/purchase'
import { formatDate, formatPrice } from '@/lib/utils'
import { paymentLabels, purchaseStatusLabels } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function AdminPurchasesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const requests = await prisma.purchaseRequest.findMany({
    where: searchParams.q
      ? {
          OR: [
            { reference: { contains: searchParams.q, mode: 'insensitive' } },
            { customer: { fullName: { contains: searchParams.q, mode: 'insensitive' } } },
            { customer: { phone: { contains: searchParams.q } } },
          ],
        }
      : {},
    include: {
      customer: true,
      vehicle: { select: { brand: true, model: true, year: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <PageHeader title="Demandes d'achat" description={`${requests.length} demande(s).`} />

      <div className="mb-5">
        <SearchInput placeholder="Reference, client ou telephone" />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
          <h2 className="font-display text-lg font-semibold">Aucune demande</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Les demandes d'achat envoyees depuis les fiches vehicules arriveront ici.
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
                <th className="px-5 py-3.5 font-medium">Budget</th>
                <th className="px-5 py-3.5 font-medium">Paiement</th>
                <th className="px-5 py-3.5 font-medium">Recue le</th>
                <th className="px-5 py-3.5 font-medium">Statut</th>
                <th className="px-5 py-3.5 text-right font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium">{r.reference}</td>
                  <td className="px-5 py-3">
                    <p>{r.customer.fullName}</p>
                    <a href={`tel:${r.customer.phone}`} className="text-xs text-accent">
                      {r.customer.phone}
                    </a>
                    <a href={`mailto:${r.customer.email}`} className="block text-xs text-muted">
                      {r.customer.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {r.vehicle.brand} {r.vehicle.model} ({r.vehicle.year})
                  </td>
                  <td className="px-5 py-3">{r.budget ? formatPrice(r.budget as never) : '-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="neutral">{paymentLabels[r.payment]}</Badge>
                      {r.financing && <Badge tone="accent">Financement</Badge>}
                      {r.tradeIn && <Badge tone="gold">Reprise</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <StatusSelect
                      id={r.id}
                      value={r.status}
                      options={purchaseStatusLabels}
                      action={updatePurchaseStatus}
                      ariaLabel={`Statut de la demande ${r.reference}`}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <NoteEditor id={r.id} note={r.internalNote} action={addPurchaseNote} />
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
