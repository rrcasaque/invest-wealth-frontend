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
  getCurrentUser,
  refreshAccessToken,
  revokeSession,
  setAccessToken,
} from '@/features/auth/services/auth.service'
import { migrateLocalData } from '@/shared/services/local-data-migration.service'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  /** True enquanto tentamos restaurar a sessão no boot (via /auth/refresh). */
  isRestoring: boolean
  login: (session: AuthSession, accessToken?: string, refreshToken?: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  // O refresh token HttpOnly restaura a autenticação; os dados da sessão vêm de /auth/me.
  useEffect(() => {
    window.localStorage.removeItem('investwealth-session')
    let cancelled = false
    
    // Função auxiliar para tentar restaurar a sessão com retry
    const attemptRestore = async (retries = 2): Promise<void> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (cancelled) return
        
        try {
          const token = await refreshAccessToken()
          if (cancelled || !token) {
            if (attempt < retries) {
              // Aguarda um pouco antes de tentar novamente
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
              continue
            }
            return
          }
          
          const currentUser = await getCurrentUser()
          if (cancelled) return
          
          setSession(currentUser ?? null)
          if (currentUser) {
            void migrateLocalData().catch(() => {
              // Mantém os dados locais para uma próxima tentativa em caso de falha.
            })
          }
          return // Sucesso, sai do loop
        } catch (error) {
          if (attempt < retries) {
            // Aguarda antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          }
        }
      }
    }
    
    attemptRestore()
      .finally(() => {
        if (!cancelled) setIsRestoring(false)
      })
    
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!session) return
    const refreshInterval = window.setInterval(() => {
      void refreshAccessToken()
    }, 10 * 60 * 1000)
    return () => window.clearInterval(refreshInterval)
  }, [session])

  const login = useCallback((newSession: AuthSession, token?: string, refreshToken?: string) => {
    setSession(newSession)
    if (token) {
      setAccessToken(token)
      void migrateLocalData().catch(() => {
        // Mantém os dados locais para uma próxima tentativa em caso de falha.
      })
    }
    // Salva o refresh token no localStorage como fallback (se fornecido)
    if (refreshToken) {
      window.localStorage.setItem('iw_refresh_fallback', refreshToken)
    }
  }, [])

  const logout = useCallback(async () => {
    await revokeSession()
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
