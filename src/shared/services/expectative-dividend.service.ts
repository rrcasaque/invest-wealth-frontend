import type { PortfolioPosition } from '@/shared/types/portfolio'
import type { ExpectativeDividendMonth } from '@/shared/types/expectative-dividend'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class StatusInvestScrapingError extends Error {
  constructor() {
    super('Erro ao consultar Status Invest, atualize o scraper.')
    this.name = 'StatusInvestScrapingError'
  }
}

function isFiiTicker(ticker: string): boolean {
  return /^[A-Z]{4}11$/.test(ticker.trim().toUpperCase())
}

function getFiiPositions(positions: PortfolioPosition[]): PortfolioPosition[] {
  return positions.filter((position) => isFiiTicker(position.ticker))
}

export async function fetchExpectativeDividendMonth(
  positions: PortfolioPosition[],
): Promise<ExpectativeDividendMonth> {
  const fiiPositions = getFiiPositions(positions)

  try {
    const response = await fetch(`${API_URL}/stock/expectative-dividend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: fiiPositions.map((position) => ({
          ticker: position.ticker,
          shares: position.shares,
        })),
      }),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as ExpectativeDividendMonth
  } catch {
    throw new StatusInvestScrapingError()
  }
}

export async function getOrFetchExpectativeDividendMonth(
  _forceRefresh = false,
  positions: PortfolioPosition[],
): Promise<ExpectativeDividendMonth> {
  return fetchExpectativeDividendMonth(positions)
}
