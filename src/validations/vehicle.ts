import { z } from 'zod'

const currentYear = new Date().getFullYear()

const optionalPrice = z
  .union([z.coerce.number().min(0, 'Le montant doit etre positif.'), z.literal('')])
  .transform((v) => (v === '' ? null : Number(v)))
  .nullable()

export const vehicleSchema = z
  .object({
    reference: z.string().min(2, 'Indiquez une reference interne.').max(30),
    brand: z.string().min(1, 'Indiquez la marque.'),
    model: z.string().min(1, 'Indiquez le modele.'),
    version: z.string().max(60).optional().or(z.literal('')),
    category: z.enum([
      'BERLINE', 'SUV', 'CITADINE', 'PICKUP', 'UTILITAIRE', 'MONOSPACE', 'COUPE', 'LUXE',
    ]),
    year: z.coerce
      .number()
      .int()
      .min(1980, 'Annee trop ancienne.')
      .max(currentYear + 1, 'Annee invalide.'),
    offerType: z.enum(['SALE', 'RENT', 'BOTH']),
    status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'MAINTENANCE']),

    salePrice: optionalPrice,
    dailyPrice: optionalPrice,
    weeklyPrice: optionalPrice,
    monthlyPrice: optionalPrice,
    deposit: optionalPrice,

    mileage: z.coerce.number().int().min(0, 'Kilometrage invalide.'),
    fuel: z.enum(['ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE', 'GPL']),
    transmission: z.enum(['MANUELLE', 'AUTOMATIQUE']),
    color: z.string().min(2, 'Indiquez la couleur.'),
    seats: z.coerce.number().int().min(1).max(20),
    doors: z.coerce.number().int().min(2).max(7),
    power: z.coerce.number().int().min(1, 'Indiquez la puissance.'),
    vin: z.string().max(24).optional().or(z.literal('')),

    description: z.string().min(30, 'La description fait au moins 30 caracteres.'),
    features: z.array(z.string()).default([]),
    rentalConditions: z.string().optional().or(z.literal('')),
    requiredDocuments: z.array(z.string()).default([]),

    featured: z.boolean().default(false),
    published: z.boolean().default(false),
  })
  .refine(
    (data) => data.offerType === 'RENT' || data.salePrice !== null,
    { message: 'Indiquez un prix de vente pour un vehicule a vendre.', path: ['salePrice'] },
  )
  .refine(
    (data) => data.offerType === 'SALE' || data.dailyPrice !== null,
    { message: 'Indiquez un tarif journalier pour un vehicule a louer.', path: ['dailyPrice'] },
  )

export const vehicleImageSchema = z.object({
  vehicleId: z.string().cuid(),
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().min(3),
})

export type VehicleInput = z.input<typeof vehicleSchema>
export type VehicleOutput = z.output<typeof vehicleSchema>
