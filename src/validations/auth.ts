import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(8, 'Le mot de passe contient au moins 8 caracteres.'),
})

export const userSchema = z.object({
  name: z.string().min(2, 'Indiquez le nom complet.'),
  email: z.string().email('Adresse e-mail invalide.'),
  password: z
    .string()
    .min(10, 'Le mot de passe contient au moins 10 caracteres.')
    .regex(/[A-Z]/, 'Ajoutez au moins une majuscule.')
    .regex(/[0-9]/, 'Ajoutez au moins un chiffre.'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER']),
})

export type LoginInput = z.infer<typeof loginSchema>
export type UserInput = z.infer<typeof userSchema>
