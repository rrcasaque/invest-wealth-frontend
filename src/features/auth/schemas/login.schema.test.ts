import { describe, it, expect } from 'vitest'
import { loginSchema } from './login.schema'

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = loginSchema.safeParse({ email: 'joao@instituicao.com', password: 'senha123' })
    expect(result.success).toBe(true)
  })

  it('rejeita e-mail vazio', () => {
    const result = loginSchema.safeParse({ email: '', password: 'senha123' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    const result = loginSchema.safeParse({ email: 'nao-email', password: 'senha123' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'joao@instituicao.com', password: '' })
    expect(result.success).toBe(false)
  })
})
