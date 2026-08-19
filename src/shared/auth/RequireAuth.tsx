import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Protege rotas que exigem autenticação.
 * Redireciona para /entrar se não houver sessão, preservando a URL original.
 * Enquanto a sessão está sendo restaurada via /auth/refresh, aguarda.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) {
    // Poderia renderizar um skeleton; por simplicidade, retorna null.
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace state={{ from: location }} />
  }

  return <>{children}</>
}
