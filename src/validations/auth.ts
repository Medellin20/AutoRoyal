import { z } from 'zod'

export const loginSchema = z.object({
  password: z.string().min(1, 'Saisissez le mot de passe.'),
})

export type LoginInput = z.infer<typeof loginSchema>
