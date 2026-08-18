import type { SimulationParameters, SimulationResult, SimulationSeriesPoint } from '../types'

/**
 * Calculate a compound growth projection based on the provided parameters.
 *
 * The model uses monthly compounding for contributions and an annualised
 * expected return. When `reinvestDividends` is true, the dividend yield is
 * added to the growth rate; otherwise dividends are treated as cash flow
 * and excluded from the compounded principal.
 */
export function runSimulation(params: SimulationParameters): SimulationResult {
  const {
    initialInvestment,
    monthlyContribution,
    years,
    expectedReturn,
    dividendYield,
    reinvestDividends,
  } = params

  const effectiveAnnualRate = (expectedReturn + (reinvestDividends ? dividendYield : 0)) / 100
  const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1

  const series: SimulationSeriesPoint[] = []
  let balance = initialInvestment
  let contributions = initialInvestment

  series.push({ year: 0, total: round(balance), contributions: round(contributions) })

  const totalMonths = years * 12
  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    contributions += monthlyContribution
    if (month % 12 === 0) {
      series.push({ year: month / 12, total: round(balance), contributions: round(contributions) })
    }
  }

  const projectedValue = round(balance)
  const totalContributions = round(contributions)
  const totalEarnings = round(projectedValue - totalContributions)
  const growthPercentage =
    initialInvestment > 0
      ? round(((projectedValue - initialInvestment) / initialInvestment) * 100)
      : 0

  return {
    projectedValue,
    totalContributions,
    totalEarnings,
    growthPercentage,
    series,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export const simulationService = {
  async run(params: SimulationParameters): Promise<SimulationResult> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return runSimulation(params)
  },
}
