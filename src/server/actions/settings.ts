'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'
import { settingsSchema } from '@/validations/contact'
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
