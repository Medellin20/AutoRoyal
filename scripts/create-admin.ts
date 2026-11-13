import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
import { randomUUID } from 'node:crypto'

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Laurent Crash Autos'

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.')
}
if (!email || !password || password.length < 10) {
  throw new Error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (10 caractères minimum) dans .env.')
}

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

  const passwordHash = await bcrypt.hash(password!, 12)
  const { error: insertError } = await supabase.from('users').insert({
    id: randomUUID(),
    name,
    email: email!,
    passwordHash,
    role: 'SUPER_ADMIN',
    active: true,
  })

  if (insertError) throw insertError
  console.log(`Compte super administrateur créé pour ${email}.`)
}

createAdmin().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
