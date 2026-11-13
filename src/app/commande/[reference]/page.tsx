import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock3, Download, ShieldCheck } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { ButtonLink } from '@/components/ui/button'
import { getSupabaseAdmin } from '@/lib/supabase'
import { formatDateTime, formatPrice } from '@/lib/utils'
import type { Customer, SalesOrder } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paiement de la commande', robots: { index: false, follow: false } }

export default async function OrderPaymentPage({
  params,
  searchParams,
}: {
  params: { reference: string }
  searchParams: { token?: string }
}) {
  if (!searchParams.token) notFound()
  const db = getSupabaseAdmin()
  const { data: orderRow, error } = await db.from('sales_orders').select('*')
    .eq('reference', params.reference).eq('guestAccessToken', searchParams.token).maybeSingle()
  if (error || !orderRow) notFound()
  const order = orderRow as SalesOrder
  const { data: customerRow } = await db.from('customers').select('*').eq('id', order.customerId).maybeSingle()
  if (!customerRow) notFound()
  const customer = customerRow as Customer
  const settings = order.paymentInstructions
  const snapshot = order.vehicleSnapshot
  const canPay = order.status === 'PENDING_PAYMENT'
  const vehicleName = String(snapshot.title ?? `${String(snapshot.brand ?? '')} ${String(snapshot.model ?? '')} ${String(snapshot.year ?? '')}`).trim()
  const currency = String(snapshot.currency ?? 'EUR')
  const receipt = `/api/commandes/${encodeURIComponent(order.reference)}/recu?token=${encodeURIComponent(searchParams.token)}`

  return (
    <PublicShell>
      <section className="shell max-w-3xl py-12 sm:py-16">
        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-9">
          <p className="eyebrow">Commande {order.reference}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Votre commande est enregistrée</h1>
          <p className="mt-2 text-sm text-muted">Créée le {formatDateTime(order.createdAt)} · {customer.fullName}</p>

          <div className="mt-7 rounded-2xl bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{vehicleName}</p>
                <p className="mt-1 text-sm text-muted">Réf. véhicule {String(snapshot.reference ?? '')}</p>
              </div>
              <p className="font-display text-xl font-semibold text-accent">{formatPrice(order.totalAmount, currency)}</p>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm">
              {order.paymentStatus === 'CONFIRMED' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock3 className="h-4 w-4 text-warning" />}
              Statut du paiement : <strong>{order.paymentStatus === 'CONFIRMED' ? 'confirmé par notre équipe' : order.paymentStatus === 'REJECTED' ? 'à vérifier avec notre équipe' : 'en attente de vérification'}</strong>
            </p>
          </div>

          {!canPay && order.status === 'CANCELLED' && <p className="mt-6 rounded-xl bg-danger/10 p-4 text-sm">Cette commande a été annulée. N’effectuez pas de paiement pour cette référence.</p>}

          {canPay && settings?.paymentMethod === 'BANK_TRANSFER' && settings.iban && settings.bic ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Régler par virement bancaire</h2>
              <dl className="mt-4 grid gap-3 rounded-2xl border border-line p-5 text-sm sm:grid-cols-2">
                {settings.bankAccountHolder && <div><dt className="text-muted">Titulaire</dt><dd className="mt-1 font-medium">{settings.bankAccountHolder}</dd></div>}
                {settings.bankName && <div><dt className="text-muted">Banque</dt><dd className="mt-1 font-medium">{settings.bankName}</dd></div>}
                <div><dt className="text-muted">IBAN</dt><dd className="mt-1 break-all font-medium">{settings.iban}</dd></div>
                <div><dt className="text-muted">BIC</dt><dd className="mt-1 font-medium">{settings.bic}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-muted">Indiquez la référence <strong>{order.reference}</strong> dans le motif du virement.</p>
            </section>
          ) : null}

          {canPay && settings?.paymentMethod === 'PAYMENT_LINK' && settings.paymentLinkUrl ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Régler en ligne</h2>
              <p className="mt-2 text-sm text-muted">Le paiement sera marqué comme reçu après vérification par notre équipe.</p>
              <ButtonLink href={settings.paymentLinkUrl} target="_blank" rel="noopener noreferrer" className="mt-4">Ouvrir le lien de paiement</ButtonLink>
            </section>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
            <a href={receipt} download className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line px-5 text-sm font-medium hover:bg-surface">
              <Download className="h-4 w-4" /> Télécharger le reçu PDF
            </a>
            <Link href="/vehicules" className="inline-flex h-11 items-center justify-center rounded-pill px-5 text-sm font-medium text-muted hover:bg-surface">Retour au catalogue</Link>
          </div>
          <p className="mt-5 flex gap-2 rounded-xl bg-warning/10 p-4 text-xs leading-relaxed text-ink/75">
            <ShieldCheck className="h-4 w-4 shrink-0 text-warning" />
            Ce reçu confirme la création de la commande, pas la réception du paiement. Le téléchargement du PDF ne modifie jamais le statut. Seule une vérification réelle par l’équipe peut confirmer le paiement.
          </p>
          <p className="mt-4 text-xs text-muted">Adresse e-mail enregistrée pour cette commande : {customer.email}. Conservez cette page pour retrouver les informations de la commande.</p>
        </div>
      </section>
    </PublicShell>
  )
}
