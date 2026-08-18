import type {
  AllocationTarget,
  BalancingInput,
  BalancingResult,
  PortfolioAsset,
  PortfolioRecommendation,
} from '../types'
import { fetchLatestQuotes } from './brapi.service'
import { getStoredPositions } from '@/shared/storage/portfolio-storage'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--tertiary))',
  'hsl(var(--outline))',
  'hsl(190 70% 45%)',
  'hsl(30 80% 55%)',
  'hsl(270 70% 60%)',
  'hsl(145 60% 45%)',
  'hsl(340 70% 60%)',
  'hsl(55 75% 45%)',
]

function buildAssets(
  positions: { ticker: string; shares: number }[],
  quotes: Awaited<ReturnType<typeof fetchLatestQuotes>>,
): PortfolioAsset[] {
  return positions.map(({ ticker, shares }) => {
    const quote = quotes.get(ticker)
    if (!quote) throw new Error(`Cotação não encontrada para ${ticker}.`)
    return { ticker, name: quote.name, shares, price: quote.price, currentValue: shares * quote.price }
  })
}

function calculatePurchases(assets: PortfolioAsset[], newCapital: number) {
  const projectedShares = assets.map((asset) => asset.shares)
  const projectedValue = assets.reduce((total, asset) => total + asset.currentValue, 0) + newCapital
  const targetValue = projectedValue / assets.length
  let remainingCapital = newCapital

  while (true) {
    let bestIndex = -1
    let bestDeficit = 0

    for (let index = 0; index < assets.length; index += 1) {
      const assetValue = projectedShares[index] * assets[index].price
      const deficit = targetValue - assetValue
      if (assets[index].price <= remainingCapital && deficit > bestDeficit) {
        bestIndex = index
        bestDeficit = deficit
      }
    }

    if (bestIndex < 0) break
    projectedShares[bestIndex] += 1
    remainingCapital -= assets[bestIndex].price
  }

  return { projectedShares, projectedValue, remainingCapital }
}

export function calculateBalancingResult(
  assets: PortfolioAsset[],
  newCapital: number,
  quoteUpdatedAt: string | null,
): BalancingResult {
  const currentValue = assets.reduce((total, asset) => total + asset.currentValue, 0)
  const { projectedShares, projectedValue, remainingCapital } = calculatePurchases(assets, newCapital)
  const targetPercentage = 100 / assets.length
  const allocation: AllocationTarget[] = assets.map((asset, index) => ({
    id: asset.ticker,
    label: asset.ticker,
    targetPercentage,
    currentPercentage: (asset.currentValue / currentValue) * 100,
    color: COLORS[index % COLORS.length],
  }))
  const recommendations: PortfolioRecommendation[] = assets.map((asset, index) => {
    const projectedAssetValue = projectedShares[index] * asset.price
    const currentPercentage = (asset.currentValue / currentValue) * 100
    const action: PortfolioRecommendation['action'] = projectedShares[index] > asset.shares ? 'buy' : 'hold'
    return {
      id: asset.ticker,
      assetName: asset.name,
      ticker: asset.ticker,
      action,
      amount: (projectedShares[index] - asset.shares) * asset.price,
      sharesToBuy: projectedShares[index] - asset.shares,
      price: asset.price,
      currentPercentage,
      projectedPercentage: (projectedAssetValue / projectedValue) * 100,
      targetPercentage,
    }
  }).sort((first, second) => second.sharesToBuy - first.sharesToBuy)

  const deviation = Math.max(
    ...recommendations.map((recommendation) => Math.abs(recommendation.projectedPercentage - targetPercentage)),
  )

  return {
    currentValue,
    projectedValue,
    investedValue: newCapital - remainingCapital,
    remainingCapital,
    deviation,
    allocation,
    recommendations,
    assets,
    quoteUpdatedAt,
  }
}

export const portfolioBalancingService = {
  async calculate(input: BalancingInput): Promise<BalancingResult> {
    const positions = getStoredPositions()
    if (positions.length === 0) {
      throw new Error('Nenhum ativo encontrado. Importe sua carteira da B3 antes de calcular o balanceamento.')
    }

    const tickers = positions.map((position) => position.ticker)
    const quotes = await fetchLatestQuotes(tickers)
    const assets = buildAssets(positions, quotes)
    return calculateBalancingResult(assets, input.newCapital, new Date().toISOString())
  },
}
