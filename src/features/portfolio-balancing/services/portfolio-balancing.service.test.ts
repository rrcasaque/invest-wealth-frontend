import { describe, expect, it } from 'vitest'
import { calculateBalancingResult } from './portfolio-balancing.service'
import type { PortfolioAsset } from '../types'

const assets: PortfolioAsset[] = [
  { ticker: 'AAA11', name: 'Fundo A', shares: 10, price: 10, currentValue: 100 },
  { ticker: 'BBB11', name: 'Fundo B', shares: 2, price: 50, currentValue: 100 },
]

describe('calculateBalancingResult', () => {
  it('calcula compras em cotas inteiras e preserva o saldo restante', () => {
    const result = calculateBalancingResult(assets, 50, null)

    expect(result.currentValue).toBe(200)
    expect(result.projectedValue).toBe(250)
    expect(result.investedValue).toBe(30)
    expect(result.remainingCapital).toBe(20)
    expect(result.recommendations.every((recommendation) => Number.isInteger(recommendation.sharesToBuy))).toBe(true)
    expect(result.recommendations.find((recommendation) => recommendation.ticker === 'AAA11')?.sharesToBuy).toBe(3)
  })

  it('não compra uma cota que ultrapassaria o capital disponível', () => {
    const result = calculateBalancingResult(assets, 9, null)

    expect(result.investedValue).toBe(0)
    expect(result.remainingCapital).toBe(9)
    expect(result.recommendations.every((recommendation) => recommendation.sharesToBuy === 0)).toBe(true)
  })
})
