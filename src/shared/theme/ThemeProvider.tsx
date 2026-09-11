import * as React from 'react'
import { useAuth } from '@/shared/auth'
import { api } from '@/shared/api/client'
import { getSystemTheme, type Theme } from '@/shared/storage/theme-storage'

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

interface PreferencesResponse {
  theme: 'DARK' | 'LIGHT'
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const { session, isRestoring } = useAuth()
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme ?? getSystemTheme())

  React.useEffect(() => {
    window.localStorage.removeItem('investwealth-theme')
    applyThemeToDocument(theme)
  }, [theme])

  React.useEffect(() => {
    if (isRestoring || !session) return
    let active = true
    void api.get<PreferencesResponse>('/preferences').then((preferences) => {
      if (active) setThemeState(preferences.theme === 'DARK' ? 'dark' : 'light')
    }).catch(() => {
      // Usa o tema do sistema enquanto a preferência ainda não puder ser carregada.
    })
    return () => { active = false }
  }, [isRestoring, session])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    if (session) {
      void api.patch('/preferences', { theme: next.toUpperCase() }).catch(() => {
        // O estado visual permanece responsivo mesmo se a gravação falhar.
      })
    }
  }, [session])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
