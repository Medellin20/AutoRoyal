'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { cancelSalesOrder, reviewSalesOrderPayment } from '@/server/actions/sales-orders'

export function PaymentReview({
  id,
  paymentStatus,
  orderStatus,
  canReview,
}: {
  id: string
  paymentStatus: string
  orderStatus: string
  canReview: boolean
}) {
  const router = useRouter()
  const [reference, setReference] = useState('')
  const [pending, startTransition] = useTransition()
  const closed = orderStatus !== 'PENDING_PAYMENT'

  function review(status: 'CONFIRMED' | 'REJECTED') {
    if (status === 'CONFIRMED' && reference.trim().length < 4) {
      toast.error('Saisissez la référence du paiement réellement reçu.')
      return
    }
    startTransition(async () => {
      const result = await reviewSalesOrderPayment(id, status, reference)
      if (result.ok) {
        toast.success(result.message ?? 'Paiement mis à jour.')
        router.refresh()
      } else toast.error(result.message ?? 'Action impossible.')
    })
  }

  function cancel() {
    if (!window.confirm('Annuler cette commande et remettre le véhicule en disponibilité ?')) return
    startTransition(async () => {
      const result = await cancelSalesOrder(id)
      if (result.ok) {
        toast.success(result.message ?? 'Commande annulée.')
        router.refresh()
      } else toast.error(result.message ?? 'Action impossible.')
    })
  }

  if (closed || !canReview) return <span className="text-xs text-muted">{closed ? 'Commande clôturée' : 'Vérification réservée aux administrateurs'}</span>

  return (
    <div className="min-w-52 space-y-2">
      {paymentStatus !== 'CONFIRMED' && (
        <>
          <Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Référence vérifiée du virement" aria-label="Référence réelle du paiement" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="h-8 px-3 text-xs" disabled={pending} onClick={() => review('CONFIRMED')}>Confirmer le paiement</Button>
            <Button type="button" variant="secondary" className="h-8 px-3 text-xs" disabled={pending} onClick={() => review('REJECTED')}>Refuser</Button>
          </div>
        </>
      )}
      <button type="button" disabled={pending} onClick={cancel} className="text-xs text-danger underline underline-offset-2 disabled:opacity-50">Annuler la commande</button>
    </div>
  )
}
