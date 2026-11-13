import 'server-only'
import { getSupabaseAdmin, newId } from '@/lib/supabase'
import type { Customer } from '@/types/database'

export async function saveCustomer(input: {
  fullName: string
  email: string
  phone: string
  address?: string | null
}) {
  const db = getSupabaseAdmin()
  const payload = {
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    ...(input.address !== undefined ? { address: input.address || null } : {}),
    updatedAt: new Date().toISOString(),
  }
  const { data: existing, error: lookupError } = await db.from('customers').select('*')
    .eq('email', payload.email).eq('phone', payload.phone).maybeSingle()
  if (lookupError) throw lookupError
  if (existing) {
    const { data, error } = await db.from('customers').update(payload).eq('id', existing.id).select('*').single()
    if (error) throw error
    return data as Customer
  }
  const { data, error } = await db.from('customers').insert({ id: newId(), ...payload }).select('*').single()
  if (error) throw error
  return data as Customer
}
