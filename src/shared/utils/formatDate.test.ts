import { describe, it, expect } from 'vitest'
import { formatDate, formatMonthShort } from './formatDate'

describe('formatDate', () => {
  it('formata data ISO em formato médio', () => {
    const result = formatDate('2023-10-24', 'medium')
    expect(result).toContain('2023')
  })

  it('lida com formato curto', () => {
    const result = formatDate('2023-10-24', 'short')
    expect(result).toBeTruthy()
  })
})

describe('formatMonthShort', () => {
  it('retorna abreviação para mês válido', () => {
    expect(formatMonthShort('Jan')).toBeTruthy()
  })

  it('retorna string não vazia para entrada desconhecida', () => {
    expect(formatMonthShort('Foo')).toBeTruthy()
  })
})
