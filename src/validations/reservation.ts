import { z } from 'zod'
import { siteConfig } from '@/config/site'

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/

export const reservationSchema = z
  .object({
    vehicleId: z.string().min(1, 'Choisissez un vehicule.'),
    startDate: z.coerce.date({ invalid_type_error: 'Date de debut invalide.' }),
    endDate: z.coerce.date({ invalid_type_error: 'Date de fin invalide.' }),
    pickupPlace: z.string().min(2, 'Indiquez le lieu de recuperation.'),
    returnPlace: z.string().min(2, 'Indiquez le lieu de retour.'),
    fullName: z.string().min(3, 'Indiquez votre nom complet.'),
    phone: z.string().regex(phoneRegex, 'Numero de telephone invalide.'),
    email: z.string().email('Adresse e-mail invalide.'),
    address: z.string().min(4, 'Indiquez votre adresse.'),
    message: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'La date de fin doit suivre la date de debut.',
    path: ['endDate'],
  })
  .refine(
    (d) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d.startDate >= today
    },
    { message: 'La date de debut ne peut pas etre passee.', path: ['startDate'] },
  )
  .refine(
    (d) => {
      const days = Math.round((+d.endDate - +d.startDate) / 86_400_000)
      return days <= siteConfig.booking.maxDays
    },
    { message: `Duree maximale : ${siteConfig.booking.maxDays} jours.`, path: ['endDate'] },
  )

export const reservationStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'REFUSED', 'CANCELLED', 'ONGOING', 'COMPLETED']),
})

export const internalNoteSchema = z.object({
  id: z.string().cuid(),
  note: z.string().max(2000),
})

export type ReservationInput = z.input<typeof reservationSchema>
