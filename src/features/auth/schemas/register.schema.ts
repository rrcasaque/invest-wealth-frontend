import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Informe o seu nome completo.')
      .max(120, 'O nome deve ter no máximo 120 caracteres.'),
    workEmail: z
      .string()
      .min(1, 'Informe o seu e-mail corporativo.')
      .email('Formato de e-mail inválido.'),
    password: z
      .string()
      .min(12, 'A senha deve ter pelo menos 12 caracteres.')
      .regex(/[0-9]/, 'A senha deve conter ao menos um número.')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um símbolo.'),
    acceptTerms: z.literal(true, {
      message: 'Você deve aceitar os termos para continuar.',
    }),
  })

export type RegisterValues = z.infer<typeof registerSchema>

export type PasswordStrength = 'weak' | 'medium' | 'strong'

export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 2) return 'weak'
  if (score === 3) return 'medium'
  return 'strong'
}
