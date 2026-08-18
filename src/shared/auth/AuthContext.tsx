import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AuthSession } from '@/features/auth/types'

const STORAGE_KEY = 'investwealth-session'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (parsed && typeof parsed.userId === 'string' && typeof parsed.email === 'string') {
      return parsed
    }
  } catch {
    /* localStorage might be unavailable or corrupted */
  }
  return null
}

function writeStoredSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  const login = useCallback((newSession: AuthSession) => {
    writeStoredSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    writeStoredSession(null)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return ctx
}
