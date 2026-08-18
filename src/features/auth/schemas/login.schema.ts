import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o seu e-mail institucional.')
    .email('Formato de e-mail inválido.'),
  password: z.string().min(1, 'Informe a sua senha.'),
})

export type LoginValues = z.infer<typeof loginSchema>
