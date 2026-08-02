import { z } from 'zod'

export const contactSchema = z.object({
  fullName: z.string().min(3, 'Indiquez votre nom.'),
  email: z.string().email('Adresse e-mail invalide.'),
  phone: z.string().max(20).optional().or(z.literal('')),
  subject: z.string().min(3, 'Indiquez un objet.'),
  message: z.string().min(10, 'Votre message fait au moins 10 caracteres.').max(2000),
})

export const settingsSchema = z.object({
  garageName: z.string().min(2),
  tagline: z.string().max(160).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  whatsapp: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  mapUrl: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadecimale attendue.'),
})

export type ContactInput = z.input<typeof contactSchema>
export type SettingsInput = z.input<typeof settingsSchema>
