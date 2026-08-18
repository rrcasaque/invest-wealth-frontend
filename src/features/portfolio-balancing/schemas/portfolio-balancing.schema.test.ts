import { describe, it, expect } from 'vitest'
import { portfolioBalancingSchema } from './portfolio-balancing.schema'

describe('portfolioBalancingSchema', () => {
  it('aceita valor positivo', () => {
    const result = portfolioBalancingSchema.safeParse({ newCapital: '250000.00' })
    expect(result.success).toBe(true)
  })

  it('aceita valor com vírgula decimal', () => {
    const result = portfolioBalancingSchema.safeParse({ newCapital: '250000,00' })
    expect(result.success).toBe(true)
  })

  it('rejeita valor vazio', () => {
    const result = portfolioBalancingSchema.safeParse({ newCapital: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita valor zero', () => {
    const result = portfolioBalancingSchema.safeParse({ newCapital: '0' })
    expect(result.success).toBe(false)
  })

  it('rejeita valor negativo', () => {
    const result = portfolioBalancingSchema.safeParse({ newCapital: '-100' })
    expect(result.success).toBe(false)
  })
})
