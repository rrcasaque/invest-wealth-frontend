import { z } from 'zod'

export const portfolioBalancingSchema = z.object({
  newCapital: z
    .string()
    .min(1, 'Informe um valor para distribuir.')
    .refine((value) => {
      const normalized = value.replace(/\./g, '').replace(',', '.')
      const number = Number(normalized)
      return !Number.isNaN(number) && number > 0
    }, 'O valor deve ser um número positivo.'),
})

export type PortfolioBalancingValues = z.infer<typeof portfolioBalancingSchema>
