import { z } from 'zod'

const phoneRegex = /^\+?[0-9\s().-]{7,30}$/

export const createSalesOrderSchema = z.object({
  vehicleId: z.string().min(1),
  fullName: z.string().trim().min(3).max(120),
  phone: z.string().trim().regex(phoneRegex, 'Numéro de téléphone invalide.'),
  email: z.string().trim().email().max(200),
})

export const paymentReviewSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['CONFIRMED', 'REJECTED']),
  paymentReference: z.string().trim().max(160).optional().default(''),
}).superRefine((data, ctx) => {
  if (data.status === 'CONFIRMED' && data.paymentReference.length < 4) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['paymentReference'], message: 'La référence du paiement vérifié est obligatoire.' })
  }
})
