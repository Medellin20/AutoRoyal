import { headers } from 'next/headers'
import { getSupabaseAdmin, newId } from '@/lib/supabase'

type AuditInput = {
  userId?: string | null
  userEmail: string
  action: string
  entity: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}

/** Journalise une action administrative. N'interrompt jamais le flux principal. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    const ip =
      headers().get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headers().get('x-real-ip') ??
      null

    const { error } = await getSupabaseAdmin().from('audit_logs').insert({
      id: newId(), userId: input.userId === 'env-admin' ? null : input.userId ?? null, userEmail: input.userEmail,
      action: input.action, entity: input.entity, entityId: input.entityId ?? null,
      metadata: input.metadata ?? {}, ip,
    })
    if (error) throw error
  } catch (error) {
    console.error('[audit] echec de journalisation', error)
  }
}
