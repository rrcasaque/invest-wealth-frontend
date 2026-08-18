export interface SimulationParameters {
  initialInvestment: number
  monthlyContribution: number
  years: number
  expectedReturn: number
  dividendYield: number
  reinvestDividends: boolean
}

export type SimulationHorizon = '10A' | '20A' | '30A'

export interface SimulationResult {
  projectedValue: number
  totalContributions: number
  totalEarnings: number
  growthPercentage: number
  series: SimulationSeriesPoint[]
}

export interface SimulationSeriesPoint {
  year: number
  total: number
  contributions: number
}
