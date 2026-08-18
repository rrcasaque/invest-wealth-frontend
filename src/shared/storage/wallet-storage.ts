import type { WalletAsset } from '../types/wallet'

const STORAGE_KEY = 'investwealth-wallet'

export function getStoredWalletAssets(): WalletAsset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletAsset[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function storeWalletAssets(assets: WalletAsset[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch {
    /* localStorage might be unavailable (private mode, SSR) */
  }
}

export function clearWalletAssets(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
