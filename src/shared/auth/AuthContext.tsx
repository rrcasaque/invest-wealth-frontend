import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthSession } from '@/features/auth/types'
import {
  getAccessToken,
  refreshAccessToken,
  revokeSession,
  setAccessToken,
} from '@/features/auth/services/auth.service'

const SESSION_KEY = 'investwealth-session'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  /** True enquanto tentamos restaurar a sessão no boot (via /auth/refresh). */
  isRestoring: boolean
  login: (session: AuthSession, accessToken?: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
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
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // A sessão (userId/email/name) pode ser persistida em localStorage sem risco
  // de segurança — não contém credenciais. O access token fica só em memória.
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())
  const [isRestoring, setIsRestoring] = useState<boolean>(() => readStoredSession() !== null)

  // No boot, se há sessão persistida, tenta restaurar o access token via
  // /auth/refresh (cookie HttpOnly). Se falhar, limpa a sessão.
  useEffect(() => {
    let cancelled = false
    const stored = readStoredSession()
    if (!stored) {
      setIsRestoring(false)
      return
    }
    refreshAccessToken()
      .then((token) => {
        if (cancelled) return
        if (!token) {
          // Refresh falhou: sessão expirada — limpa.
          writeStoredSession(null)
          setSession(null)
        }
        // Se token ok, a sessão persistida continua válida.
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback((newSession: AuthSession, token?: string) => {
    writeStoredSession(newSession)
    setSession(newSession)
    if (token) setAccessToken(token)
  }, [])

  const logout = useCallback(async () => {
    await revokeSession()
    writeStoredSession(null)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null && getAccessToken() !== null,
      isRestoring,
      login,
      logout,
    }),
    // isRestoring é incluído para re-render quando a restauração termina.
    // session cobre login/logout. (access token em memória não é estado React;
    // isAuthenticated é derivado dele, mas reavaliado quando session muda ou
    // isRestoring muda.)
    [session, isRestoring, login, logout],
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
