import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

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

    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        userEmail: input.userEmail,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as object,
        ip,
      },
    })
  } catch (error) {
    console.error('[audit] echec de journalisation', error)
  }
}
