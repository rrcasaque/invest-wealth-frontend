import { z } from 'zod'

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o seu e-mail institucional.')
    .email('Formato de e-mail inválido.'),
  code: z
    .string()
    .min(6, 'O código deve ter 6 dígitos.')
    .max(6, 'O código deve ter 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
})

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>
