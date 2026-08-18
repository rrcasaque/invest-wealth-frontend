import { describe, it, expect } from 'vitest'
import { runSimulation } from './simulation.service'

describe('runSimulation', () => {
  it('retorna valor projetado maior que o investimento inicial quando retorno é positivo', () => {
    const result = runSimulation({
      initialInvestment: 10000,
      monthlyContribution: 0,
      years: 10,
      expectedReturn: 7,
      dividendYield: 0,
      reinvestDividends: false,
    })
    expect(result.projectedValue).toBeGreaterThan(10000)
  })

  it('totalContributions soma investimento inicial + contribuições mensais', () => {
    const result = runSimulation({
      initialInvestment: 10000,
      monthlyContribution: 100,
      years: 1,
      expectedReturn: 0,
      dividendYield: 0,
      reinvestDividends: false,
    })
    // 10000 + 100*12 = 11200
    expect(result.totalContributions).toBeCloseTo(11200, 0)
  })

  it('totalEarnings é zero quando retorno é zero', () => {
    const result = runSimulation({
      initialInvestment: 10000,
      monthlyContribution: 100,
      years: 5,
      expectedReturn: 0,
      dividendYield: 0,
      reinvestDividends: false,
    })
    expect(result.totalEarnings).toBe(0)
  })

  it('reinvestir dividendos aumenta o valor projetado', () => {
    const base = runSimulation({
      initialInvestment: 10000,
      monthlyContribution: 0,
      years: 10,
      expectedReturn: 7,
      dividendYield: 3,
      reinvestDividends: false,
    })
    const withReinvest = runSimulation({
      initialInvestment: 10000,
      monthlyContribution: 0,
      years: 10,
      expectedReturn: 7,
      dividendYield: 3,
      reinvestDividends: true,
    })
    expect(withReinvest.projectedValue).toBeGreaterThan(base.projectedValue)
  })

  it('gera série com um ponto por ano + o ponto inicial', () => {
    const result = runSimulation({
      initialInvestment: 1000,
      monthlyContribution: 0,
      years: 5,
      expectedReturn: 5,
      dividendYield: 0,
      reinvestDividends: false,
    })
    expect(result.series).toHaveLength(6) // ano 0 + anos 1..5
    expect(result.series[0].year).toBe(0)
    expect(result.series[5].year).toBe(5)
  })
})
