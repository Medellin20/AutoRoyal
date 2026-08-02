'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { purchaseSchema, purchaseStatusSchema } from '@/validations/purchase'
import { makeReference } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { can } from '@/lib/permissions'
import type { ActionResult } from '@/types'

export async function createPurchaseRequest(
  formData: FormData,
): Promise<ActionResult<{ reference: string }>> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = purchaseSchema.safeParse({
    ...raw,
    financing: raw.financing === 'on' || raw.financing === 'true',
    tradeIn: raw.tradeIn === 'on' || raw.tradeIn === 'true',
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    select: { id: true, published: true, offerType: true, status: true },
  })

  if (!vehicle || !vehicle.published || vehicle.offerType === 'RENT') {
    return { ok: false, message: "Ce vehicule n'est pas propose a la vente." }
  }
  if (vehicle.status === 'SOLD') {
    return { ok: false, message: 'Ce vehicule est deja vendu.' }
  }

  const customer = await prisma.customer.upsert({
    where: { email_phone: { email: data.email.toLowerCase(), phone: data.phone } },
    update: { fullName: data.fullName },
    create: { fullName: data.fullName, email: data.email.toLowerCase(), phone: data.phone },
  })

  const request = await prisma.purchaseRequest.create({
    data: {
      reference: makeReference('ACH'),
      vehicleId: vehicle.id,
      customerId: customer.id,
      budget: data.budget,
      payment: data.payment,
      financing: data.financing,
      tradeIn: data.tradeIn,
      tradeInInfo: data.tradeInInfo || null,
      message: data.message || null,
    },
  })

  revalidatePath('/admin/demandes-achat')
  return {
    ok: true,
    data: { reference: request.reference },
    message: 'Demande envoyee. Un conseiller vous rappelle sous 24 h.',
  }
}

export async function updatePurchaseStatus(id: string, status: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'purchase:update')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const parsed = purchaseStatusSchema.safeParse({ id, status })
  if (!parsed.success) return { ok: false, message: 'Statut invalide.' }

  await prisma.purchaseRequest.update({ where: { id }, data: { status: parsed.data.status } })
  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'UPDATE_PURCHASE_STATUS',
    entity: 'PurchaseRequest',
    entityId: id,
    metadata: { status: parsed.data.status },
  })

  revalidatePath('/admin/demandes-achat')
  return { ok: true, message: 'Statut mis a jour.' }
}

export async function addPurchaseNote(id: string, note: string): Promise<ActionResult> {
  const user = await requireAdmin()
  await prisma.purchaseRequest.update({ where: { id }, data: { internalNote: note.slice(0, 2000) } })
  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'ADD_PURCHASE_NOTE',
    entity: 'PurchaseRequest',
    entityId: id,
  })
  revalidatePath('/admin/demandes-achat')
  return { ok: true, message: 'Note enregistree.' }
}
