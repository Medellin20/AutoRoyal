import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Laurent Crash Autos'

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.')
}
if (!email) throw new Error('Définissez ADMIN_EMAIL dans .env.')

async function createAdmin() {
  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email!)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingUser) throw new Error(`Un compte existe déjà pour ${email}.`)

  let authUser: { id: string; user_metadata: Record<string, unknown>; app_metadata: Record<string, unknown> } | null = null
  for (let page = 1; !authUser; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    authUser = data.users.find((user) => user.email?.toLowerCase() === email) ?? null
    if (authUser || data.users.length < 1000) break
  }

  let createdAuthUser = false
  if (authUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      email_confirm: true,
      user_metadata: { ...authUser.user_metadata, name },
      app_metadata: { ...authUser.app_metadata, role: 'SUPER_ADMIN' },
    })
    if (error || !data.user) throw error ?? new Error('Mise à jour du compte Auth impossible.')
    authUser = data.user
  } else {
    if (!password || password.length < 10) {
      throw new Error('Définissez ADMIN_PASSWORD (10 caractères minimum) pour créer un nouveau compte.')
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: email!,
      password: password!,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role: 'SUPER_ADMIN' },
    })
    if (error || !data.user) throw error ?? new Error('Création Supabase Auth impossible.')
    authUser = data.user
    createdAuthUser = true
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: authUser.id,
    name,
    email: email!,
    passwordHash: 'managed-by-supabase-auth',
    role: 'SUPER_ADMIN',
    active: true,
  })

  if (insertError) {
    if (createdAuthUser) await supabase.auth.admin.deleteUser(authUser.id)
    throw insertError
  }
  console.log(`Compte super administrateur ${createdAuthUser ? 'créé' : 'rattaché'} pour ${email}.`)
}

createAdmin().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
