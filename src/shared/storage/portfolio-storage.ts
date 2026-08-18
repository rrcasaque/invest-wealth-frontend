import type { PortfolioImportResult, PortfolioPosition } from '../types/portfolio'

const STORAGE_KEY = 'investwealth-portfolio'
const IMPORT_META_KEY = 'investwealth-portfolio-meta'

export interface PortfolioMeta {
  fileName: string
  importedAt: string
}

export function getStoredPositions(): PortfolioPosition[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PortfolioPosition[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function getStoredPortfolioMeta(): PortfolioMeta | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(IMPORT_META_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PortfolioMeta
  } catch {
    return null
  }
}

export function storePortfolio(result: PortfolioImportResult): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.positions))
    window.localStorage.setItem(
      IMPORT_META_KEY,
      JSON.stringify({ fileName: result.fileName, importedAt: result.importedAt }),
    )
  } catch {
    /* localStorage might be unavailable (private mode, SSR) */
  }
}

export function clearPortfolio(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(IMPORT_META_KEY)
  } catch {
    /* ignore */
  }
}
