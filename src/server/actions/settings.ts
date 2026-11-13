'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, newId } from '@/lib/supabase'
import { settingsSchema } from '@/validations/contact'
import { userSchema } from '@/validations/auth'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAudit } from '@/lib/audit'
import type { ActionResult } from '@/types'

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'settings:update')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await getSupabaseAdmin().from('site_settings').upsert({
    id: 'default', ...parsed.data, updatedAt: new Date().toISOString(),
  })
  if (error) return { ok: false, message: 'Impossible d enregistrer les parametres.' }

  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'UPDATE_SETTINGS', entity: 'SiteSetting', entityId: 'default' })
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Parametres enregistres.' }
}

export async function createAdminUser(formData: FormData): Promise<ActionResult> {
  const current = await requireAdmin()
  if (!can(current.role, 'user:manage')) {
    return { ok: false, message: 'Seul un super administrateur gere les comptes.' }
  }

  const parsed = userSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const db = getSupabaseAdmin()
  const email = parsed.data.email.toLowerCase()
  const { data: exists, error: lookupError } = await db.from('users').select('id').eq('email', email).maybeSingle()
  if (lookupError) return { ok: false, message: 'Verification du compte impossible.' }
  if (exists) return { ok: false, message: 'Cette adresse est deja utilisee.' }

  const { data: created, error } = await db.from('users').insert({
    id: newId(), name: parsed.data.name, email,
    passwordHash: await bcrypt.hash(parsed.data.password, 12), role: parsed.data.role,
  }).select('id').single()
  if (error || !created) return { ok: false, message: 'Creation du compte impossible.' }

  await logAudit({
    userId: current.id,
    userEmail: current.email ?? '',
    action: 'CREATE_USER',
    entity: 'User',
    entityId: created.id,
    metadata: { role: parsed.data.role },
  })

  revalidatePath('/admin/parametres')
  return { ok: true, message: 'Compte cree.' }
}

export async function toggleUserActive(id: string, active: boolean): Promise<ActionResult> {
  const current = await requireAdmin()
  if (!can(current.role, 'user:manage')) {
    return { ok: false, message: 'Seul un super administrateur gere les comptes.' }
  }
  if (id === current.id) return { ok: false, message: 'Vous ne pouvez pas desactiver votre propre compte.' }

  const { error } = await getSupabaseAdmin().from('users')
    .update({ active, updatedAt: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false, message: 'Modification du compte impossible.' }
  await logAudit({
    userId: current.id,
    userEmail: current.email ?? '',
    action: active ? 'ENABLE_USER' : 'DISABLE_USER',
    entity: 'User',
    entityId: id,
  })

  revalidatePath('/admin/parametres')
  return { ok: true, message: active ? 'Compte reactive.' : 'Compte desactive.' }
}
