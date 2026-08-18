import { describe, it, expect } from 'vitest'
import { formatCompact } from './formatNumber'

describe('formatCompact', () => {
  it('formata valores na casa dos milhares', () => {
    const result = formatCompact(1500)
    expect(result).toBeTruthy()
    expect(result.length).toBeLessThan(10)
  })

  it('formata valores na casa dos milhões de forma compacta', () => {
    const result = formatCompact(1_500_000)
    expect(result.length).toBeLessThanOrEqual(6)
  })

  it('formata zero', () => {
    expect(formatCompact(0)).toBeTruthy()
  })
})
