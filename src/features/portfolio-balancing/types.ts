export interface PortfolioAsset {
  ticker: string
  name: string
  shares: number
  price: number
  currentValue: number
}

export interface AllocationTarget {
  id: string
  label: string
  targetPercentage: number
  currentPercentage: number
  color: string
}

export interface PortfolioRecommendation {
  id: string
  assetName: string
  ticker: string
  action: 'buy' | 'sell' | 'hold'
  amount: number
  sharesToBuy: number
  price: number
  currentPercentage: number
  projectedPercentage: number
  targetPercentage: number
}

export interface BalancingResult {
  currentValue: number
  projectedValue: number
  investedValue: number
  remainingCapital: number
  deviation: number
  allocation: AllocationTarget[]
  recommendations: PortfolioRecommendation[]
  assets: PortfolioAsset[]
  quoteUpdatedAt: string | null
}

export interface BalancingInput {
  newCapital: number
}
