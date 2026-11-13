'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin, getSupabasePublic, newId } from '@/lib/supabase'
import { saveCustomer } from '@/server/customers'
import { reservationSchema, reservationStatusSchema, internalNoteSchema } from '@/validations/reservation'
import { diffInDays, makeReference } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { can } from '@/lib/permissions'
import type { ActionResult } from '@/types'

/** Verifie qu'aucune reservation active ne chevauche la periode demandee. */
export async function isVehicleAvailable(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<boolean> {
  let query = getSupabaseAdmin().from('reservations').select('id')
    .eq('vehicleId', vehicleId).in('status', ['PENDING', 'CONFIRMED', 'ONGOING'])
    .lt('startDate', endDate.toISOString()).gt('endDate', startDate.toISOString())
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query
  if (error) throw error
  return !data?.length
}

/** Calcule le tarif : degressif semaine/mois si les tarifs existent. */
function computeQuote(
  days: number,
  prices: { daily: number | null; weekly: number | null; monthly: number | null },
  differentReturn: boolean,
) {
  const daily = prices.daily ?? 0
  let base = daily * days

  if (prices.monthly && days >= 30) {
    const months = Math.floor(days / 30)
    const rest = days % 30
    base = months * prices.monthly + rest * daily
  } else if (prices.weekly && days >= 7) {
    const weeks = Math.floor(days / 7)
    const rest = days % 7
    base = weeks * prices.weekly + rest * daily
  }

  const extraFees =
    siteConfig.booking.serviceFee + (differentReturn ? siteConfig.booking.differentReturnFee : 0)

  return { base, extraFees, total: base + extraFees }
}

export async function createReservation(formData: FormData): Promise<ActionResult<{ reference: string }>> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = reservationSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data

  const { data: vehicle, error: vehicleError } = await getSupabasePublic().from('vehicles')
    .select('id,brand,model,status,offerType,dailyPrice,weeklyPrice,monthlyPrice,published')
    .eq('id', data.vehicleId).maybeSingle()
  if (vehicleError) return { ok: false, message: 'Impossible de verifier ce vehicule.' }

  if (!vehicle || !vehicle.published || vehicle.offerType === 'SALE') {
    return { ok: false, message: "Ce vehicule n'est pas proposé a la location." }
  }
  if (vehicle.status !== 'AVAILABLE') {
    return { ok: false, message: "Ce vehicule n'est pas disponible actuellement." }
  }

  const free = await isVehicleAvailable(data.vehicleId, data.startDate, data.endDate)
  if (!free) {
    return {
      ok: false,
      message: 'Ce vehicule est deja reserve sur cette periode. Choisissez d autres dates.',
      fieldErrors: { startDate: ['Periode indisponible.'] },
    }
  }

  const days = diffInDays(data.startDate, data.endDate)
  const quote = computeQuote(
    days,
    {
      daily: vehicle.dailyPrice ? Number(vehicle.dailyPrice) : null,
      weekly: vehicle.weeklyPrice ? Number(vehicle.weeklyPrice) : null,
      monthly: vehicle.monthlyPrice ? Number(vehicle.monthlyPrice) : null,
    },
    data.pickupPlace !== data.returnPlace,
  )

  let customer
  try {
    customer = await saveCustomer({ fullName: data.fullName, email: data.email, phone: data.phone, address: data.address })
  } catch {
    return { ok: false, message: 'Impossible d enregistrer les coordonnees du client.' }
  }

  const { data: reservation, error } = await getSupabaseAdmin().from('reservations').insert({
    id: newId(), reference: makeReference('RES'), vehicleId: vehicle.id, customerId: customer.id,
    startDate: data.startDate.toISOString(), endDate: data.endDate.toISOString(),
    pickupPlace: data.pickupPlace, returnPlace: data.returnPlace, days,
    totalPrice: quote.total, extraFees: quote.extraFees, message: data.message || null,
  }).select('reference').single()
  if (error) return { ok: false, message: 'Impossible d enregistrer la demande de reservation.' }

  revalidatePath('/admin/reservations')
  return {
    ok: true,
    data: { reference: reservation.reference },
    message: 'Demande enregistree. Nous vous rappelons pour confirmer.',
  }
}

export async function updateReservationStatus(id: string, status: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'reservation:update')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const parsed = reservationStatusSchema.safeParse({ id, status })
  if (!parsed.success) return { ok: false, message: 'Statut invalide.' }

  const { data: reservation, error } = await getSupabaseAdmin().from('reservations')
    .update({ status: parsed.data.status, updatedAt: new Date().toISOString() })
    .eq('id', id).select('vehicleId').single()
  if (error || !reservation) return { ok: false, message: 'Reservation introuvable.' }

  // Le statut du vehicule suit celui de la reservation.
  if (parsed.data.status === 'ONGOING') {
    await getSupabaseAdmin().from('vehicles').update({ status: 'RENTED', updatedAt: new Date().toISOString() }).eq('id', reservation.vehicleId)
  }
  if (['COMPLETED', 'CANCELLED', 'REFUSED'].includes(parsed.data.status)) {
    await getSupabaseAdmin().from('vehicles').update({ status: 'AVAILABLE', updatedAt: new Date().toISOString() }).eq('id', reservation.vehicleId)
  }
  if (parsed.data.status === 'CONFIRMED') {
    await getSupabaseAdmin().from('vehicles').update({ status: 'RESERVED', updatedAt: new Date().toISOString() }).eq('id', reservation.vehicleId)
  }

  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'UPDATE_RESERVATION_STATUS',
    entity: 'Reservation',
    entityId: id,
    metadata: { status: parsed.data.status },
  })

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return { ok: true, message: 'Statut mis a jour.' }
}

export async function addReservationNote(id: string, note: string): Promise<ActionResult> {
  const user = await requireAdmin()
  const parsed = internalNoteSchema.safeParse({ id, note })
  if (!parsed.success) return { ok: false, message: 'Note invalide.' }

  const { error } = await getSupabaseAdmin().from('reservations').update({ internalNote: parsed.data.note }).eq('id', id)
  if (error) return { ok: false, message: 'Impossible d enregistrer la note.' }
  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'ADD_RESERVATION_NOTE',
    entity: 'Reservation',
    entityId: id,
  })

  revalidatePath('/admin/reservations')
  return { ok: true, message: 'Note enregistree.' }
}
