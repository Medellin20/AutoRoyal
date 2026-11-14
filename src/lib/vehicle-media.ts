import 'server-only'
import { getSupabaseAdmin, newId } from '@/lib/supabase'

const BUCKET = 'vehicle-images'
const STORAGE_PREFIX = 'supabase:'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export type UploadResult = { url: string; publicId: string }

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/** Stocke une image publique dans Supabase Storage, dans le dossier du véhicule. */
export async function uploadImage(file: File, vehicleId: string): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format accepté : JPEG, PNG, WebP ou AVIF.')
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('Chaque image doit peser entre 1 octet et 5 Mo.')
  }

  const path = `${vehicleId}/${newId()}.${extensions[file.type]}`
  const storage = getSupabaseAdmin().storage.from(BUCKET)
  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  return { url: storage.getPublicUrl(path).data.publicUrl, publicId: `${STORAGE_PREFIX}${path}` }
}

/** Supprime une image et son objet du stockage public. */
export async function deleteImage(path: string): Promise<void> {
  if (!path.startsWith(STORAGE_PREFIX)) return
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path.slice(STORAGE_PREFIX.length)])
  if (error) throw error
}
