import { z } from 'zod'

export const login2faSchema = z.object({
  code: z
    .string()
    .min(6, 'O código deve ter 6 dígitos.')
    .max(6, 'O código deve ter 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
})

export type Login2faValues = z.infer<typeof login2faSchema>
