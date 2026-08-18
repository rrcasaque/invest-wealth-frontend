interface BrapiQuoteListItem {
  stock: string
  name: string
  close: number | null
  change: number | null
  volume: number | null
  market_cap: number | null
  logo: string | null
  sector: string | null
  subsector: string | null
  type: string | null
  subType: string | null
}

interface BrapiQuoteListResponse {
  stocks?: BrapiQuoteListItem[]
  totalCount?: number
  totalPages?: number
}

const BRAPI_BASE_URL = 'https://brapi.dev/api/quote/list'

export interface BrapiQuote {
  symbol: string
  name: string
  price: number
}

export async function fetchLatestQuotes(tickers: string[]): Promise<Map<string, BrapiQuote>> {
  const token = import.meta.env.VITE_BRAPI_TOKEN
  const url = `${BRAPI_BASE_URL}?type=fund&subType=fii&limit=500`
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  const data = (await response.json()) as BrapiQuoteListResponse & { message?: string }
  if (!response.ok) {
    throw new Error(data.message ?? `Não foi possível obter as cotações (HTTP ${response.status}).`)
  }

  const quotes = new Map<string, BrapiQuote>()
  for (const item of data.stocks ?? []) {
    if (item.close !== null && item.close > 0) {
      quotes.set(item.stock.toUpperCase(), {
        symbol: item.stock.toUpperCase(),
        name: item.name,
        price: item.close,
      })
    }
  }

  const missingTickers = tickers.filter((ticker) => !quotes.has(ticker))
  if (missingTickers.length > 0) {
    throw new Error(`A API não retornou cotação para: ${missingTickers.join(', ')}.`)
  }

  return quotes
}
