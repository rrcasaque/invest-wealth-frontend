import { describe, it, expect } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formata valores BRL com símbolo R$', () => {
    expect(formatCurrency(1234.5, { currency: 'BRL' })).toMatch(/R\$/)
  })

  it('formata valores USD com símbolo US$', () => {
    expect(formatCurrency(1000, { currency: 'USD' })).toMatch(/US\$/)
  })

  it('respeita o sinal quando signed=true para valores positivos', () => {
    expect(formatCurrency(500, { signed: true })).toContain('+')
  })

  it('respeita o sinal quando signed=true para valores negativos', () => {
    const result = formatCurrency(-500, { signed: true })
    expect(result).toContain('-')
  })

  it('lida com zero', () => {
    expect(formatCurrency(0)).toBeTruthy()
  })
})
