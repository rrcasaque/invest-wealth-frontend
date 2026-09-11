export type Theme = 'dark' | 'light'

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveInitialTheme(): Theme {
  return getSystemTheme()
}
