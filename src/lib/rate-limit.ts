import { getSupabaseAdmin, newId } from '@/lib/supabase'

const WINDOW_MINUTES = 15
const MAX_ATTEMPTS = 5

/** Verifie si l'email ou l'IP a depasse le quota de tentatives de connexion. */
export async function isLoginBlocked(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000)

  const { data, error } = await getSupabaseAdmin().from('login_attempts').select('id')
    .eq('success', false).gte('createdAt', since.toISOString())
    .or(`email.eq.${email.toLowerCase()},ip.eq.${ip}`)
  if (error) throw error
  return (data?.length ?? 0) >= MAX_ATTEMPTS
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  const db = getSupabaseAdmin()
  const { error } = await db.from('login_attempts').insert({ id: newId(), email: email.toLowerCase(), ip, success })
  if (error) throw error

  if (success) {
    // On purge l'historique d'echecs apres une connexion reussie.
    const { error: deleteError } = await db.from('login_attempts').delete().eq('email', email.toLowerCase()).eq('success', false)
    if (deleteError) throw deleteError
  }
}
