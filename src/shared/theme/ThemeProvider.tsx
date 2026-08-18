import * as React from 'react'
import {
  getStoredTheme,
  getSystemTheme,
  storeTheme,
  type Theme,
} from '@/shared/storage/theme-storage'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(
    () => getStoredTheme() ?? defaultTheme ?? getSystemTheme(),
  )

  React.useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  // Sync across tabs / windows
  React.useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'investwealth-theme' && event.newValue) {
        const next = event.newValue as Theme
        if (next === 'dark' || next === 'light') setThemeState(next)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // React to system changes when the user hasn't chosen explicitly
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => {
      if (!getStoredTheme()) setThemeState(getSystemTheme())
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    storeTheme(next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      storeTheme(next)
      return next
    })
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  }
  return ctx
}
