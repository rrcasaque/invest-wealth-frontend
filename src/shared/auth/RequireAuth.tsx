import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Protege rotas que exigem autenticação.
 * Redireciona para /entrar se não houver sessão, preservando a URL original.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace state={{ from: location }} />
  }

  return <>{children}</>
}
