import { z } from 'zod'

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail institucional associado à sua conta.')
    .email('Formato de e-mail inválido.'),
  code: z
    .string()
    .min(6, 'O código deve ter 6 dígitos.')
    .max(6, 'O código deve ter 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
  newPassword: z
    .string()
    .min(12, 'A senha deve ter pelo menos 12 caracteres.')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número.')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um símbolo.'),
})

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
