import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/cloudinary'

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

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true, _count: { select: { images: true } } },
  })
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

  try {
    const created = []
    let position = vehicle._count.images

    for (const file of files) {
      const { url, publicId } = await uploadImage(file)
      const image = await prisma.vehicleImage.create({
        data: {
          vehicleId,
          url,
          publicId,
          alt: `${vehicle.brand} ${vehicle.model}`,
          position,
          isMain: position === 0,
        },
      })
      created.push(image)
      position += 1
    }

    return NextResponse.json({ images: created }, { status: 201 })
  } catch (error) {
    console.error('[upload]', error)
    return NextResponse.json({ message: 'Televersement impossible. Reessayez.' }, { status: 500 })
  }
}
