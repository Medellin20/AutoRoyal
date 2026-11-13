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
    damageLevel: z.enum(['LEGER', 'MODERE', 'IMPORTANT', 'NON_ROULANT', 'A_DEFINIR']),
    runningCondition: z.enum(['ROULANT', 'DEMARRE', 'NON_ROULANT', 'A_VERIFIER']),
    damageTypes: z.array(z.string().min(2).max(80)).max(20).default([]),
    title: z.string().min(5, 'Indiquez un titre clair pour l’annonce.').max(120),
    vehicleType: z.enum(['VOITURE', 'UTILITAIRE', 'MOTO', 'CAMION', 'AUTRE']),
    engine: z.string().min(2, 'Indiquez la motorisation.').max(80),
    displacement: z.coerce.number().int().min(0).max(20000),
    drivetrain: z.enum(['TRACTION', 'PROPULSION', 'INTEGRALE', 'AUTRE']),
    bodyCondition: z.enum(['BON', 'MOYEN', 'ENDOMMAGE', 'A_VERIFIER']),
    damageDescription: z.string().min(10, 'Décrivez les dommages (10 caractères minimum).').max(3000),
    titleStatus: z.enum(['A_VERIFIER', 'CLAIR', 'ACCIDENTE', 'MANQUANT']),
    city: z.string().min(2, 'Indiquez la ville.').max(100),
    country: z.string().min(2, 'Indiquez le pays.').max(100),
    currency: z.enum(['EUR', 'USD', 'GBP', 'XOF']),
    quantity: z.coerce.number().int().min(0).max(1000),
    keysCount: z.coerce.number().int().min(0).max(20),
    internationalSale: z.boolean().default(false),
    videoUrl: z.union([z.literal(''), z.string().url().max(500)]).optional().default(''),

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
    (data) => data.salePrice !== null,
    { message: 'Indiquez un prix fixe de vente.', path: ['salePrice'] },
  )
  .refine(
    (data) => !data.published || (data.title.length >= 5 && data.brand.length > 0 && data.model.length > 0 && data.damageDescription.length >= 10 && data.damageTypes.length > 0 && data.damageLevel !== 'A_DEFINIR' && data.quantity > 0),
    { message: 'Complétez les informations obligatoires avant publication.', path: ['published'] },
  )

export const vehicleImageSchema = z.object({
  vehicleId: z.string().cuid(),
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().min(3),
})

export type VehicleInput = z.input<typeof vehicleSchema>
export type VehicleOutput = z.output<typeof vehicleSchema>
