import { z } from 'zod'

export const simulationSchema = z.object({
  initialInvestment: z
    .number({ message: 'Informe o investimento inicial.' })
    .min(0, 'O investimento inicial deve ser maior ou igual a zero.'),
  monthlyContribution: z
    .number({ message: 'Informe a contribuição mensal.' })
    .min(0, 'A contribuição mensal deve ser maior ou igual a zero.'),
  years: z
    .number({ message: 'Informe o horizonte em anos.' })
    .min(1, 'O horizonte deve ser de pelo menos 1 ano.')
    .max(80, 'O horizonte máximo é 80 anos.'),
  expectedReturn: z
    .number({ message: 'Informe o retorno esperado.' })
    .min(-50, 'O retorno esperado parece inconsistente.')
    .max(100, 'O retorno esperado parece inconsistente.'),
  dividendYield: z
    .number({ message: 'Informe o rendimento de dividendos.' })
    .min(0, 'O rendimento de dividendos deve ser maior ou igual a zero.')
    .max(100, 'O rendimento de dividendos deve ser menor que 100%.'),
  reinvestDividends: z.boolean(),
})

export type SimulationValues = z.infer<typeof simulationSchema>
