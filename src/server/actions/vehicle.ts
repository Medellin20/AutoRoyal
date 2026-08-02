'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { vehicleSchema } from '@/validations/vehicle'
import { slugify, makeReference } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAudit } from '@/lib/audit'
import { deleteImage } from '@/lib/cloudinary'
import type { ActionResult } from '@/types'

/** Genere un slug unique : marque-modele-annee[-2] */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base)
  let n = 1
  while (
    await prisma.vehicle.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

function parseVehicleForm(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, string>
  return vehicleSchema.safeParse({
    ...raw,
    features: formData.getAll('features').filter(Boolean) as string[],
    requiredDocuments: formData.getAll('requiredDocuments').filter(Boolean) as string[],
    featured: raw.featured === 'on' || raw.featured === 'true',
    published: raw.published === 'on' || raw.published === 'true',
  })
}

export async function createVehicle(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:create')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const parsed = parseVehicleForm(formData)
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const d = parsed.data
  const exists = await prisma.vehicle.findUnique({ where: { reference: d.reference } })
  if (exists) {
    return { ok: false, message: 'Reference deja utilisee.', fieldErrors: { reference: ['Reference deja utilisee.'] } }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ...d,
      version: d.version || null,
      vin: d.vin || null,
      rentalConditions: d.rentalConditions || null,
      slug: await uniqueSlug(`${d.brand} ${d.model} ${d.year}`),
      publishedAt: d.published ? new Date() : null,
    },
  })

  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'CREATE_VEHICLE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    metadata: { reference: vehicle.reference },
  })

  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, data: { id: vehicle.id }, message: 'Vehicule cree.' }
}

export async function updateVehicle(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:update')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const parsed = parseVehicleForm(formData)
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Corrigez les champs signales.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const d = parsed.data
  const current = await prisma.vehicle.findUnique({ where: { id } })
  if (!current) return { ok: false, message: 'Vehicule introuvable.' }

  await prisma.vehicle.update({
    where: { id },
    data: {
      ...d,
      version: d.version || null,
      vin: d.vin || null,
      rentalConditions: d.rentalConditions || null,
      slug:
        current.brand !== d.brand || current.model !== d.model || current.year !== d.year
          ? await uniqueSlug(`${d.brand} ${d.model} ${d.year}`, id)
          : current.slug,
      publishedAt: d.published ? current.publishedAt ?? new Date() : null,
    },
  })

  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'UPDATE_VEHICLE',
    entity: 'Vehicle',
    entityId: id,
  })

  revalidatePath('/admin/vehicules')
  revalidatePath(`/vehicules/${current.slug}`)
  return { ok: true, message: 'Vehicule mis a jour.' }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:delete')) {
    return { ok: false, message: 'Seul un administrateur peut supprimer un vehicule.' }
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: true, reservations: { where: { status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] } } } },
  })
  if (!vehicle) return { ok: false, message: 'Vehicule introuvable.' }

  if (vehicle.reservations.length > 0) {
    return { ok: false, message: 'Des reservations actives existent. Cloturez-les avant de supprimer.' }
  }

  // Suppression des fichiers distants avant la ligne en base.
  for (const image of vehicle.images) {
    if (image.publicId) await deleteImage(image.publicId).catch(() => null)
  }

  await prisma.vehicle.delete({ where: { id } })
  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'DELETE_VEHICLE',
    entity: 'Vehicle',
    entityId: id,
    metadata: { reference: vehicle.reference },
  })

  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: 'Vehicule supprime.' }
}

export async function duplicateVehicle(id: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:create')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const source = await prisma.vehicle.findUnique({ where: { id }, include: { images: true } })
  if (!source) return { ok: false, message: 'Vehicule introuvable.' }

  const { id: _id, createdAt, updatedAt, images, slug, reference, ...rest } = source

  const copy = await prisma.vehicle.create({
    data: {
      ...rest,
      reference: makeReference('VEH'),
      slug: await uniqueSlug(`${source.brand} ${source.model} ${source.year} copie`),
      published: false,
      publishedAt: null,
      views: 0,
      images: {
        create: images.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          isMain: img.isMain,
          position: img.position,
        })),
      },
    },
  })

  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'DUPLICATE_VEHICLE',
    entity: 'Vehicle',
    entityId: copy.id,
  })

  revalidatePath('/admin/vehicules')
  return { ok: true, data: { id: copy.id }, message: 'Fiche dupliquee (brouillon).' }
}

export async function togglePublish(id: string, published: boolean): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:publish')) {
    return { ok: false, message: 'Votre role ne permet pas de publier.' }
  }

  await prisma.vehicle.update({
    where: { id },
    data: { published, publishedAt: published ? new Date() : null },
  })

  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: published ? 'PUBLISH_VEHICLE' : 'UNPUBLISH_VEHICLE',
    entity: 'Vehicle',
    entityId: id,
  })

  revalidatePath('/admin/vehicules')
  revalidatePath('/vehicules')
  return { ok: true, message: published ? 'Vehicule publie.' : 'Vehicule masque.' }
}

export async function updateVehicleStatus(id: string, status: string): Promise<ActionResult> {
  const user = await requireAdmin()
  if (!can(user.role, 'vehicle:update')) {
    return { ok: false, message: 'Votre role ne permet pas cette action.' }
  }

  const allowed = ['AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'MAINTENANCE']
  if (!allowed.includes(status)) return { ok: false, message: 'Statut invalide.' }

  await prisma.vehicle.update({ where: { id }, data: { status: status as never } })
  await logAudit({
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'UPDATE_VEHICLE_STATUS',
    entity: 'Vehicle',
    entityId: id,
    metadata: { status },
  })

  revalidatePath('/admin/vehicules')
  return { ok: true, message: 'Statut mis a jour.' }
}

/** Incremente le compteur de vues (appel non bloquant depuis la fiche). */
export async function incrementVehicleViews(id: string): Promise<void> {
  await prisma.vehicle.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null)
}

// ----------------------------------------------------------- Images

export async function setMainImage(imageId: string): Promise<ActionResult> {
  const user = await requireAdmin()
  const image = await prisma.vehicleImage.findUnique({ where: { id: imageId } })
  if (!image) return { ok: false, message: 'Image introuvable.' }

  await prisma.$transaction([
    prisma.vehicleImage.updateMany({ where: { vehicleId: image.vehicleId }, data: { isMain: false } }),
    prisma.vehicleImage.update({ where: { id: imageId }, data: { isMain: true, position: 0 } }),
  ])

  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'SET_MAIN_IMAGE', entity: 'VehicleImage', entityId: imageId })
  revalidatePath('/admin/vehicules')
  return { ok: true, message: 'Image principale definie.' }
}

export async function reorderImages(vehicleId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.vehicleImage.update({ where: { id }, data: { position: index } }),
    ),
  )
  revalidatePath(`/admin/vehicules/${vehicleId}`)
  return { ok: true, message: 'Ordre enregistre.' }
}

export async function removeImage(imageId: string): Promise<ActionResult> {
  const user = await requireAdmin()
  const image = await prisma.vehicleImage.findUnique({ where: { id: imageId } })
  if (!image) return { ok: false, message: 'Image introuvable.' }

  if (image.publicId) await deleteImage(image.publicId).catch(() => null)
  await prisma.vehicleImage.delete({ where: { id: imageId } })

  await logAudit({ userId: user.id, userEmail: user.email ?? '', action: 'DELETE_IMAGE', entity: 'VehicleImage', entityId: imageId })
  revalidatePath(`/admin/vehicules/${image.vehicleId}`)
  return { ok: true, message: 'Image supprimee.' }
}
