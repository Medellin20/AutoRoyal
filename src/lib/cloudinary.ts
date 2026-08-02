import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 Mo
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export type UploadResult = { url: string; publicId: string }

/** Televerse un fichier image valide vers Cloudinary. */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format accepte : JPEG, PNG, WebP ou AVIF.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image trop lourde. Taille maximale : 5 Mo.')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise<UploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'autoroyal/vehicules',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload impossible.'))
          resolve({ url: result.secure_url, publicId: result.public_id })
        },
      )
      .end(buffer)
  })
}

/** Supprime une image du stockage distant. */
export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}
