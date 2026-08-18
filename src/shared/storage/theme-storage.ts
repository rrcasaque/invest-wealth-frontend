export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'investwealth-theme'

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'dark' || value === 'light') return value
  } catch {
    /* localStorage might be unavailable (private mode, SSR) */
  }
  return null
}

export function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}
