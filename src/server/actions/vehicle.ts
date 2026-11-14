'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin, newId } from '@/lib/supabase'
import { vehicleSchema } from '@/validations/vehicle'
import { slugify, makeReference } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAudit } from '@/lib/audit'
import { deleteImage } from '@/lib/vehicle-media'
import type { ActionResult } from '@/types'
import type { Vehicle, VehicleImage } from '@/types/database'

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = getSupabaseAdmin()
  let slug = slugify(base)
  let n = 1
  while (true) {
    let query = db.from('vehicles').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    if (!data) return slug
    n += 1
    slug = `${slugify(base)}-${n}`
  }
}

function parseVehicleForm(formData: FormData, generatedReference?: string) {
  const raw = Object.fromEntries(formData) as Record<string, string>
  return vehicleSchema.safeParse({
    ...raw,
    reference: raw.reference?.trim() || generatedReference || '',
    salePrice: raw.salePrice ?? '',
    dailyPrice: raw.dailyPrice ?? '',
    weeklyPrice: raw.weeklyPrice ?? '',
    monthlyPrice: raw.monthlyPrice ?? '',
    deposit: raw.deposit ?? '',
    features: formData.getAll('features').filter(Boolean) as string[],
    damageTypes: formData.getAll('damageTypes').filter(Boolean) as string[],
    requiredDocuments: formData.getAll('requiredDocuments').filter(Boolean) as string[],
    featured: raw.featured === 'on' || raw.featured === 'true',
    published: raw.published === 'on' || raw.published === 'true',
    internationalSale: raw.internationalSale === 'on' || raw.internationalSale === 'true',
  })
}

export async function createVehicle(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:create')) return { ok: false, message: 'Votre role ne permet pas cette action.' }
  const parsed = parseVehicleForm(formData, makeReference('VEH'))
  if (!parsed.success) return { ok: false, message: 'Corrigez les champs signales.', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const d = parsed.data
  const db = getSupabaseAdmin()
  const { data: exists, error: lookupError } = await db.from('vehicles').select('id').eq('reference', d.reference).maybeSingle()
  if (lookupError) return { ok: false, message: 'Verification de la reference impossible.' }
  if (exists) return { ok: false, message: 'Reference deja utilisee.', fieldErrors: { reference: ['Reference deja utilisee.'] } }

  const { data: vehicle, error } = await db.from('vehicles').insert({
    id: newId(), ...d,
    version: d.version || null, vin: d.vin || null, rentalConditions: d.rentalConditions || null,
    slug: await uniqueSlug(`${d.brand} ${d.model} ${d.year}`),
    published: false,
    publishedAt: null,
  }).select('id,reference').single()
  if (error || !vehicle) return { ok: false, message: 'Creation du vehicule impossible.' }

  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'CREATE_VEHICLE', entity: 'Vehicle', entityId: vehicle.id, metadata: { reference: vehicle.reference } })
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, data: { id: vehicle.id }, message: 'Fiche enregistrée en brouillon. Ajoutez maintenant ses photos.' }
}

export async function updateVehicle(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:update')) return { ok: false, message: 'Votre role ne permet pas cette action.' }
  const parsed = parseVehicleForm(formData)
  if (!parsed.success) return { ok: false, message: 'Corrigez les champs signales.', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const db = getSupabaseAdmin()
  const { data: current, error: lookupError } = await db.from('vehicles').select('*').eq('id', id).maybeSingle()
  if (lookupError) return { ok: false, message: 'Lecture du vehicule impossible.' }
  if (!current) return { ok: false, message: 'Vehicule introuvable.' }
  const d = parsed.data
  if (d.published) {
    const { data: mainImage, error: imageError } = await db.from('vehicle_images').select('id').eq('vehicleId', id).eq('isMain', true).maybeSingle()
    if (imageError || !mainImage) return { ok: false, message: 'Ajoutez une photo et définissez la photo principale avant de publier.', fieldErrors: { published: ['Une photo principale est obligatoire pour publier.'] } }
  }
  const slug = current.brand !== d.brand || current.model !== d.model || current.year !== d.year
    ? await uniqueSlug(`${d.brand} ${d.model} ${d.year}`, id)
    : current.slug

  const { error } = await db.from('vehicles').update({
    ...d, version: d.version || null, vin: d.vin || null, rentalConditions: d.rentalConditions || null,
    slug, publishedAt: d.published ? current.publishedAt ?? new Date().toISOString() : null,
  }).eq('id', id)
  if (error) return { ok: false, message: 'Mise a jour du vehicule impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'UPDATE_VEHICLE', entity: 'Vehicle', entityId: id })
  revalidatePath('/admin/vehicules')
  revalidatePath(`/vehicules/${current.slug}`)
  return { ok: true, message: 'Vehicule mis a jour.' }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:delete')) return { ok: false, message: 'Seul un administrateur peut supprimer un vehicule.' }
  const db = getSupabaseAdmin()
  const [{ data: vehicle, error: vehicleError }, { data: reservations, error: reservationsError }, { data: orders, error: ordersError }, { data: images, error: imagesError }] = await Promise.all([
    db.from('vehicles').select('*').eq('id', id).maybeSingle(),
    db.from('reservations').select('id').eq('vehicleId', id).in('status', ['PENDING', 'CONFIRMED', 'ONGOING']),
    db.from('sales_orders').select('id').eq('vehicleId', id),
    db.from('vehicle_images').select('*').eq('vehicleId', id),
  ])
  if (vehicleError || reservationsError || ordersError || imagesError) return { ok: false, message: 'Lecture du vehicule impossible.' }
  if (!vehicle) return { ok: false, message: 'Vehicule introuvable.' }
  if ((reservations ?? []).length) return { ok: false, message: 'Des reservations actives existent. Cloturez-les avant de supprimer.' }
  if ((orders ?? []).length) return { ok: false, message: 'Ce véhicule est lié à une commande. Conservez sa fiche pour garder l’historique.' }

  for (const image of (images ?? []) as VehicleImage[]) if (image.publicId) await deleteImage(image.publicId).catch(() => null)
  const { error } = await db.from('vehicles').delete().eq('id', id)
  if (error) return { ok: false, message: 'Suppression du vehicule impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'DELETE_VEHICLE', entity: 'Vehicle', entityId: id, metadata: { reference: vehicle.reference } })
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: 'Vehicule supprime.' }
}

export async function duplicateVehicle(id: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:create')) return { ok: false, message: 'Votre role ne permet pas cette action.' }
  const db = getSupabaseAdmin()
  const { data: source, error: sourceError } = await db.from('vehicles').select('*').eq('id', id).maybeSingle()
  if (sourceError) return { ok: false, message: 'Lecture du vehicule impossible.' }
  if (!source) return { ok: false, message: 'Vehicule introuvable.' }
  const { data: images, error: imageError } = await db.from('vehicle_images').select('*').eq('vehicleId', id).order('position')
  if (imageError) return { ok: false, message: 'Lecture des images impossible.' }
  const original = source as Vehicle
  const { id: _id, createdAt, updatedAt, ...rest } = original
  const copyId = newId()
  const { data: copy, error } = await db.from('vehicles').insert({
    ...rest, id: copyId, reference: makeReference('VEH'),
    slug: await uniqueSlug(`${source.brand} ${source.model} ${source.year} copie`),
    published: false, publishedAt: null, views: 0,
  }).select('id').single()
  if (error || !copy) return { ok: false, message: 'Duplication du vehicule impossible.' }

  const copiedImages = ((images ?? []) as VehicleImage[]).map((image) => ({
    id: newId(), vehicleId: copyId, url: image.url, publicId: null,
    alt: image.alt, isMain: image.isMain, position: image.position,
  }))
  if (copiedImages.length) {
    const { error: copyImageError } = await db.from('vehicle_images').insert(copiedImages)
    if (copyImageError) {
      await db.from('vehicles').delete().eq('id', copyId)
      return { ok: false, message: 'Copie des images impossible.' }
    }
  }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'DUPLICATE_VEHICLE', entity: 'Vehicle', entityId: copyId })
  revalidatePath('/admin/vehicules')
  return { ok: true, data: { id: copyId }, message: 'Fiche dupliquee (brouillon).' }
}

export async function togglePublish(id: string, published: boolean): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:publish')) return { ok: false, message: 'Votre role ne permet pas de publier.' }
  const db = getSupabaseAdmin()
  if (published) {
    const [{ data: vehicle, error: vehicleError }, { data: mainImage, error: imageError }] = await Promise.all([
      db.from('vehicles').select('*').eq('id', id).maybeSingle(),
      db.from('vehicle_images').select('id').eq('vehicleId', id).eq('isMain', true).maybeSingle(),
    ])
    if (vehicleError || imageError) return { ok: false, message: 'Vérification de la fiche impossible.' }
    const requiredText = ['title', 'brand', 'model', 'vehicleType', 'category', 'engine', 'fuel', 'transmission', 'drivetrain', 'color', 'bodyCondition', 'runningCondition', 'titleStatus', 'damageDescription', 'city', 'country', 'currency', 'description']
    const missingText = !vehicle || requiredText.some((key) => !String(vehicle[key] ?? '').trim())
    const validNumbers = vehicle && Number(vehicle.year) >= 1980 && Number(vehicle.year) <= new Date().getFullYear() + 1 && Number(vehicle.mileage) >= 0 &&
      Number(vehicle.power) > 0 && Number(vehicle.displacement) >= 0 && Number(vehicle.seats) > 0 &&
      Number(vehicle.doors) > 0 && Number(vehicle.keysCount) >= 0 && Number(vehicle.quantity) > 0 &&
      Number(vehicle.salePrice) > 0 && (vehicle.deposit == null || Number(vehicle.deposit) <= Number(vehicle.salePrice))
    const validDescription = vehicle && vehicle.title.trim().length >= 5 && vehicle.description.trim().length >= 30 && vehicle.damageDescription.trim().length >= 10
    const validDamage = vehicle && vehicle.damageLevel !== 'A_DEFINIR' && Array.isArray(vehicle.damageTypes) && vehicle.damageTypes.length > 0
    if (missingText || !validNumbers || !validDescription || !validDamage || !mainImage) {
      return { ok: false, message: 'Complétez les champs essentiels, ajoutez une description précise des dommages et une photo principale avant de publier.' }
    }
  }
  const { error } = await db.from('vehicles').update({ published, publishedAt: published ? new Date().toISOString() : null }).eq('id', id)
  if (error) return { ok: false, message: 'Mise a jour de la publication impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: published ? 'PUBLISH_VEHICLE' : 'UNPUBLISH_VEHICLE', entity: 'Vehicle', entityId: id })
  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: published ? 'Vehicule publie.' : 'Vehicule masque.' }
}

export async function updateVehicleStatus(id: string, status: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:update')) return { ok: false, message: 'Votre role ne permet pas cette action.' }
  if (!['AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'MAINTENANCE'].includes(status)) return { ok: false, message: 'Statut invalide.' }
  const { error } = await getSupabaseAdmin().from('vehicles').update({ status }).eq('id', id)
  if (error) return { ok: false, message: 'Mise a jour du statut impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'UPDATE_VEHICLE_STATUS', entity: 'Vehicle', entityId: id, metadata: { status } })
  revalidatePath('/admin/vehicules')
  return { ok: true, message: 'Statut mis a jour.' }
}

export async function incrementVehicleViews(id: string): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().rpc('increment_vehicle_views', { vehicle_id: id })
    if (error) console.warn('[views] increment impossible', error.message)
  } catch {
    // Views are best effort and should not break the vehicle page.
  }
}

export async function setMainImage(imageId: string): Promise<ActionResult> {
  const user = await requireAdmin()
  const { data: image, error } = await getSupabaseAdmin().from('vehicle_images').select('*').eq('id', imageId).maybeSingle()
  if (error || !image) return { ok: false, message: 'Image introuvable.' }
  const { error: updateError } = await getSupabaseAdmin().rpc('set_main_vehicle_image', { image_id: imageId })
  if (updateError) return { ok: false, message: 'Modification de l image principale impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'SET_MAIN_IMAGE', entity: 'VehicleImage', entityId: imageId })
  revalidatePath('/admin/vehicules')
  return { ok: true, message: 'Image principale definie.' }
}

export async function reorderImages(vehicleId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  const { error } = await getSupabaseAdmin().rpc('reorder_vehicle_images', { vehicle_id: vehicleId, ordered_ids: orderedIds })
  if (error) return { ok: false, message: 'Enregistrement de l ordre impossible.' }
  revalidatePath(`/admin/vehicules/${vehicleId}`)
  return { ok: true, message: 'Ordre enregistre.' }
}

export async function removeImage(imageId: string): Promise<ActionResult> {
  const user = await requireAdmin()
  const db = getSupabaseAdmin()
  const { data: image, error: lookupError } = await db.from('vehicle_images').select('*').eq('id', imageId).maybeSingle()
  if (lookupError || !image) return { ok: false, message: 'Image introuvable.' }
  if (image.publicId) await deleteImage(image.publicId).catch(() => null)
  const { error } = await db.from('vehicle_images').delete().eq('id', imageId)
  if (error) return { ok: false, message: 'Suppression de l image impossible.' }
  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'DELETE_IMAGE', entity: 'VehicleImage', entityId: imageId })
  revalidatePath(`/admin/vehicules/${image.vehicleId}`)
  return { ok: true, message: 'Image supprimee.' }
}
