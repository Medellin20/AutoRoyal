import { z } from 'zod'

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/

export const purchaseSchema = z.object({
  vehicleId: z.string().min(1, 'Choisissez un vehicule.'),
  fullName: z.string().min(3, 'Indiquez votre nom complet.'),
  phone: z.string().regex(phoneRegex, 'Numero de telephone invalide.'),
  email: z.string().email('Adresse e-mail invalide.'),
  budget: z
    .union([z.coerce.number().min(0), z.literal('')])
    .transform((v) => (v === '' ? null : Number(v)))
    .nullable(),
  payment: z.enum(['CASH', 'VIREMENT', 'FINANCEMENT']),
  financing: z.boolean().default(false),
  tradeIn: z.boolean().default(false),
  tradeInInfo: z.string().max(300).optional().or(z.literal('')),
  message: z.string().max(1000).optional().or(z.literal('')),
})

export const purchaseStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'NEGOTIATION', 'CLOSED', 'REFUSED']),
})

export type PurchaseInput = z.input<typeof purchaseSchema>
