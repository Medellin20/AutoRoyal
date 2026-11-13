'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin, newId } from '@/lib/supabase'
import { contactSchema } from '@/validations/contact'
import type { ActionResult } from '@/types'

export async function sendContactMessage(formData: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await getSupabaseAdmin().from('contact_messages').insert({
    id: newId(), fullName: parsed.data.fullName, email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null, subject: parsed.data.subject, message: parsed.data.message,
  })
  if (error) return { ok: false, message: 'Impossible d envoyer votre message pour le moment.' }

  revalidatePath('/admin')
  return { ok: true, message: 'Message envoye. Reponse sous 24 h ouvrees.' }
}
