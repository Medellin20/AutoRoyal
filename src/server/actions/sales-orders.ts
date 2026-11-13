'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin, getSupabasePublic, newId } from '@/lib/supabase'
import { createSalesOrderSchema, paymentReviewSchema } from '@/validations/sales-order'
import { makeReference, formatPrice } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAudit } from '@/lib/audit'
import { sendOrderAlert } from '@/server/order-email'
import type { ActionResult } from '@/types'
import type { SalesOrder, SiteSetting } from '@/types/database'

export async function createSalesOrder(
  formData: FormData,
): Promise<ActionResult<{ reference: string; accessToken: string }>> {
  const parsed = createSalesOrderSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, message: 'Corrigez les coordonnées indiquées.', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = parsed.data
  const db = getSupabaseAdmin()
  const [{ data: vehicle, error: vehicleError }, { data: settingsRow, error: settingsError }] = await Promise.all([
    getSupabasePublic().from('vehicles').select('id,brand,model,year,reference,title,currency,quantity,published,status,offerType,salePrice').eq('id', data.vehicleId).maybeSingle(),
    db.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
  ])
  if (vehicleError || settingsError) return { ok: false, message: 'Impossible de préparer la commande.' }
  if (!vehicle || !vehicle.published || vehicle.status !== 'AVAILABLE' || vehicle.offerType === 'RENT' || vehicle.salePrice === null || vehicle.quantity <= 0) {
    return { ok: false, message: 'Ce véhicule n’est plus disponible à la vente.' }
  }

  const settings = settingsRow as SiteSetting | null
  if (!settings || (settings.paymentMethod === 'BANK_TRANSFER' && (!settings.bankAccountHolder || !settings.iban || !settings.bic)) ||
    (settings.paymentMethod === 'PAYMENT_LINK' && !settings.paymentLinkUrl)) {
    return { ok: false, message: 'Le mode de paiement doit être configuré par Laurent Crash Autos avant la commande.' }
  }

  const accessToken = crypto.randomUUID()
  const reference = makeReference('CMD')
  const alertRecipient = process.env.ORDER_ALERT_EMAIL || process.env.ADMIN_EMAIL || ''
  const { data: orderData, error } = await db.rpc('create_sales_order', {
    p_order_id: newId(),
    p_reference: reference,
    p_customer_id: newId(),
    p_full_name: data.fullName,
    p_email: data.email.toLowerCase(),
    p_phone: data.phone,
    p_vehicle_id: data.vehicleId,
    p_access_token: accessToken,
    p_payment_instructions: settings.paymentMethod === 'BANK_TRANSFER'
      ? { paymentMethod: settings.paymentMethod, bankAccountHolder: settings.bankAccountHolder, bankName: settings.bankName, iban: settings.iban, bic: settings.bic }
      : { paymentMethod: settings.paymentMethod, paymentLinkUrl: settings.paymentLinkUrl },
    p_alert_recipient: alertRecipient,
  })

  const order = orderData as unknown as SalesOrder | null
  if (error || !order) {
    console.error('[sales-order] order creation failed', error?.code)
    return { ok: false, message: 'La commande n’a pas pu être créée. Vérifiez la disponibilité du véhicule puis réessayez.' }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const alert = await sendOrderAlert({
    reference,
    customerName: data.fullName,
    customerEmail: data.email,
    customerPhone: data.phone,
    vehicleLabel: `${vehicle.title || `${vehicle.brand} ${vehicle.model}`} ${vehicle.year} (${vehicle.reference})`,
    amount: formatPrice(Number(vehicle.salePrice), vehicle.currency),
    adminUrl: `${origin}/admin/commandes`,
  })
  await db.from('sales_order_notifications').update({
    recipient: alert.recipient || 'non-configure', status: alert.status, detail: alert.detail ?? null,
  }).eq('orderId', order.id)

  revalidatePath('/admin')
  revalidatePath('/admin/commandes')
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return {
    ok: true,
    data: { reference, accessToken },
    message: 'Commande créée. Le paiement reste en attente de vérification.',
  }
}

export async function reviewSalesOrderPayment(
  id: string,
  status: string,
  paymentReference = '',
): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'payment:verify')) return { ok: false, message: 'Seul un administrateur peut confirmer ou refuser un paiement.' }
  const parsed = paymentReviewSchema.safeParse({ id, status, paymentReference })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Référence de paiement invalide.' }

  const { error } = await getSupabaseAdmin().rpc('review_sales_order_payment', {
    p_order_id: parsed.data.id,
    p_status: parsed.data.status,
    p_payment_reference: parsed.data.paymentReference || null,
  })
  if (error) return { ok: false, message: error.message }

  await logAudit({
    userId: user.id, userEmail: user.email ?? '', action: 'REVIEW_SALES_ORDER_PAYMENT',
    entity: 'SalesOrder', entityId: id, metadata: { status: parsed.data.status },
  })
  revalidatePath('/admin')
  revalidatePath('/admin/commandes')
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: parsed.data.status === 'CONFIRMED' ? 'Paiement vérifié et confirmé.' : 'Paiement refusé.' }
}

export async function cancelSalesOrder(id: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'purchase:update')) return { ok: false, message: 'Votre rôle ne permet pas cette action.' }
  const { error } = await getSupabaseAdmin().rpc('cancel_sales_order', { p_order_id: id })
  if (error) return { ok: false, message: error.message }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'CANCEL_SALES_ORDER', entity: 'SalesOrder', entityId: id })
  revalidatePath('/admin')
  revalidatePath('/admin/commandes')
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: 'Commande annulée et véhicule remis en disponibilité.' }
}
