import { describe, it, expect } from 'vitest'
import { formatPercentage } from './formatPercentage'

describe('formatPercentage', () => {
  it('formata porcentagem simples', () => {
    const result = formatPercentage(12.5)
    expect(result).toContain('12,5')
    expect(result).toContain('%')
  })

  it('adiciona sinal + quando signed=true e valor positivo', () => {
    expect(formatPercentage(4.2, { signed: true })).toContain('+')
  })

  it('mantém sinal - para valores negativos com signed=true', () => {
    expect(formatPercentage(-3.1, { signed: true })).toContain('-')
  })

  it('lida com zero', () => {
    const result = formatPercentage(0)
    expect(result).toContain('0')
  })
})
