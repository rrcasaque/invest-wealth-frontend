import { z } from 'zod'

export const passwordRecoverySchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail institucional associado à sua conta.')
    .email('Formato de e-mail inválido.'),
})

export type PasswordRecoveryValues = z.infer<typeof passwordRecoverySchema>
