import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | undefined
let publicClient: SupabaseClient | undefined

function projectUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL manquant.')
  return url
}

/** Client public, limite aux annonces publiees par les politiques RLS. */
export function getSupabasePublic() {
  if (publicClient) return publicClient
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY manquant.')
  publicClient = createClient(projectUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
  return publicClient
}

/** Client privilegie, reserve au code serveur apres verification des permissions applicatives. */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant.')
  adminClient = createClient(projectUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
  return adminClient
}

export function newId() {
  return crypto.randomUUID()
}

export function throwSupabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}
