import { describe, expect, it } from 'vitest'
import { formatBRLInput, parseBRLToNumber } from './format-brl'

describe('formatBRLInput', () => {
  it('formata valores inteiros com separador de milhar e duas casas decimais', () => {
    expect(formatBRLInput(10000)).toBe('10.000,00')
    expect(formatBRLInput(1000)).toBe('1.000,00')
    expect(formatBRLInput(1000000)).toBe('1.000.000,00')
  })

  it('formata valores com centavos', () => {
    expect(formatBRLInput(1234.5)).toBe('1.234,50')
    expect(formatBRLInput(1234.56)).toBe('1.234,56')
    expect(formatBRLInput(0.99)).toBe('0,99')
  })

  it('retorna 0,00 para zero ou valores inválidos', () => {
    expect(formatBRLInput(0)).toBe('0,00')
    expect(formatBRLInput(Number.NaN)).toBe('0,00')
  })
})

describe('parseBRLToNumber', () => {
  it('converte strings mascaradas de volta para número', () => {
    expect(parseBRLToNumber('10.000,00')).toBe(10000)
    expect(parseBRLToNumber('1.234,56')).toBe(1234.56)
    expect(parseBRLToNumber('0,99')).toBe(0.99)
  })

  it('retorna 0 para strings vazias ou inválidas', () => {
    expect(parseBRLToNumber('')).toBe(0)
    expect(parseBRLToNumber('abc')).toBe(0)
  })
})
