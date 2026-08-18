import { describe, it, expect } from 'vitest'
import { evaluatePasswordStrength, registerSchema } from './register.schema'

describe('evaluatePasswordStrength', () => {
  it('classifica senhas curtas como fracas', () => {
    expect(evaluatePasswordStrength('abc')).toBe('weak')
  })

  it('classifica senha apenas com letras como fraca', () => {
    expect(evaluatePasswordStrength('abcdefghijkl')).toBe('weak')
  })

  it('classifica senha com tamanho, número e símbolo como forte', () => {
    expect(evaluatePasswordStrength('SenhaForte123!')).toBe('strong')
  })

  it('classifica senha média corretamente', () => {
    expect(evaluatePasswordStrength('SenhaForte12')).toBe('medium')
  })
})

describe('registerSchema', () => {
  const validPayload = {
    fullName: 'João Silva',
    workEmail: 'joao@instituicao.com',
    password: 'SenhaForte123!',
    acceptTerms: true as const,
  }

  it('aceita payload válido', () => {
    const result = registerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('rejeita nome muito curto', () => {
    const result = registerSchema.safeParse({ ...validPayload, fullName: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    const result = registerSchema.safeParse({ ...validPayload, workEmail: 'nao-e-email' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha sem símbolo', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: 'SenhaForte123' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha curta', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: 'Curta1!' })
    expect(result.success).toBe(false)
  })

  it('rejeita quando termos não são aceitos', () => {
    const result = registerSchema.safeParse({ ...validPayload, acceptTerms: false })
    expect(result.success).toBe(false)
  })
})
