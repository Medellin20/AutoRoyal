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
  paymentMethod: z.enum(['BANK_TRANSFER', 'PAYMENT_LINK']),
  bankAccountHolder: z.string().max(160).optional().or(z.literal('')),
  bankName: z.string().max(160).optional().or(z.literal('')),
  iban: z.string().max(34).optional().or(z.literal('')),
  bic: z.string().max(11).optional().or(z.literal('')),
  paymentLinkUrl: z.string().url().refine((url) => url.startsWith('https://'), 'Le lien de paiement doit utiliser HTTPS.').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'BANK_TRANSFER') {
    if (!data.bankAccountHolder || data.bankAccountHolder.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountHolder'], message: 'Indiquez le titulaire du compte.' })
    }
    if (!data.iban || !/^[A-Z0-9]{15,34}$/i.test(data.iban.replace(/\s/g, ''))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['iban'], message: 'IBAN invalide.' })
    }
    if (!data.bic || !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(data.bic)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bic'], message: 'BIC invalide.' })
    }
  } else if (!data.paymentLinkUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['paymentLinkUrl'], message: 'Ajoutez le lien de paiement.' })
  }
})

export type ContactInput = z.input<typeof contactSchema>
export type SettingsInput = z.input<typeof settingsSchema>
