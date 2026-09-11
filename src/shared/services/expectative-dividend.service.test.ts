import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchExpectativeDividendMonth } from './expectative-dividend.service'
import type { PortfolioPosition } from '@/shared/types/portfolio'

const positions: PortfolioPosition[] = [
  {
    ticker: 'HGLG11',
    product: 'HGLG11',
    cnpj: '',
    institution: '',
    shares: 10,
    price: 100,
    value: 1000,
  },
  {
    ticker: 'ABCD3',
    product: 'ABCD3',
    cnpj: '',
    institution: '',
    shares: 20,
    price: 10,
    value: 200,
  },
]

describe('fetchExpectativeDividendMonth', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta o backend com apenas as posições de FII', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          source: 'statusinvest',
          referenceMonth: 9,
          dividendTotal: 11,
          assets: [{ name: 'HGLG11', dividend: 1.1, cotesQuantity: 10 }],
        }),
      }),
    )

    const result = await fetchExpectativeDividendMonth(positions)

    expect(result.dividendTotal).toBe(11)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetch).mock.calls[0]).toEqual([
      expect.stringContaining('/stock/expectative-dividend'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ positions: [{ ticker: 'HGLG11', shares: 10 }] }),
      }),
    ])
  })
})
