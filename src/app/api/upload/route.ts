import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSupabaseAdmin, newId } from '@/lib/supabase'
import { uploadImage, deleteImage, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/vehicle-media'

export const runtime = 'nodejs'

/** Televerse une ou plusieurs images et les rattache a un vehicule. */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Authentification requise.' }, { status: 401 })
  }

  const formData = await request.formData()
  const vehicleId = String(formData.get('vehicleId') ?? '')
  const files = formData.getAll('files').filter((f): f is File => f instanceof File)

  if (!vehicleId) {
    return NextResponse.json({ message: 'Vehicule manquant.' }, { status: 400 })
  }
  if (files.length === 0) {
    return NextResponse.json({ message: 'Aucun fichier recu.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const [{ data: vehicle, error: vehicleError }, { count, error: countError }] = await Promise.all([
    db.from('vehicles').select('id,brand,model').eq('id', vehicleId).maybeSingle(),
    db.from('vehicle_images').select('id', { count: 'exact', head: true }).eq('vehicleId', vehicleId),
  ])
  if (vehicleError || countError) return NextResponse.json({ message: 'Lecture du vehicule impossible.' }, { status: 500 })
  if (!vehicle) {
    return NextResponse.json({ message: 'Vehicule introuvable.' }, { status: 404 })
  }

  // Validation stricte avant tout appel reseau.
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Format refuse pour ${file.name}. Utilisez JPEG, PNG, WebP ou AVIF.` },
        { status: 415 },
      )
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: `${file.name} depasse 5 Mo.` },
        { status: 413 },
      )
    }
  }

  const created = []
  const uploadedPaths: string[] = []
  try {
    let position = count ?? 0

    for (const file of files) {
      const { url, publicId } = await uploadImage(file, vehicleId)
      uploadedPaths.push(publicId)
      const { data: image, error } = await db.from('vehicle_images').insert({
        id: newId(), vehicleId, url, publicId, alt: `${vehicle.brand} ${vehicle.model}`,
        position, isMain: position === 0,
      }).select('*').single()
      if (error || !image) throw error ?? new Error('Insertion de l image impossible.')
      created.push(image)
      position += 1
    }

    return NextResponse.json({ images: created }, { status: 201 })
  } catch (error) {
    if (created.length) {
      await db.from('vehicle_images').delete().in('id', created.map((image) => image.id))
    }
    await Promise.allSettled(uploadedPaths.map(deleteImage))
    console.error('[upload]', error)
    return NextResponse.json({ message: 'Televersement impossible. Reessayez.' }, { status: 500 })
  }
}
