import type {
  AuthResult,
  Login2faPayload,
  LoginCredentials,
  PasswordRecoveryPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Access token em memória (nunca persistido em localStorage).
 * Sobrevive apenas à sessão da aba; em reload, o AuthContext chama
 * /auth/refresh (usa o cookie HttpOnly) para restaurar.
 *
 * O `apiFetch` injeta este token no header Authorization das chamadas
 * autenticadas. Em 401, tenta automaticamente /auth/refresh e refaz a
 * chamada original uma única vez.
 */
let accessToken: string | null = null

/**
 * Chave do localStorage para fallback do refresh token.
 * Usado apenas quando cookies não estão disponíveis (alguns PWAs/mobile).
 */
const REFRESH_TOKEN_STORAGE_KEY = 'iw_refresh_fallback'

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

interface ApiResponseBody {
  status?: AuthResult['status']
  message?: string
  session?: AuthResult['session']
  accessToken?: string
  refreshToken?: string
  ticket?: string
}

/** Sinaliza que um refresh já está em andamento para evitar chamadas concorrentes. */
let refreshPromise: Promise<string | null> | null = null

/**
 * Chama /auth/refresh (cookie HttpOnly é enviado automaticamente) e
 * atualiza o access token em memória. Singleton: chamadas concorrentes
 * compartilham o mesmo promise.
 */
export async function getCurrentUser(): Promise<AuthResult['session'] | null> {
  const token = getAccessToken()
  if (!token) return null
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) return null
      return getCurrentUser()
    }
    if (!response.ok) return null
    const user = (await response.json()) as { userId: string; email: string; name: string }
    return { userId: user.userId, email: user.email, name: user.name }
  } catch {
    return null
  }
}

export function refreshAccessToken(): Promise<string | null> {
  // Se já existe uma chamada em andamento, retorna o mesmo promise
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      // Tenta usar o cookie HttpOnly primeiro (método preferido)
      let res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      // Se falhar e houver um refresh token no localStorage (fallback), tenta usar
      if (!res.ok) {
        const fallbackToken = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
        if (fallbackToken) {
          res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Refresh-Token': fallbackToken,
            },
          })
        }
      }

      if (!res.ok) {
        setAccessToken(null)
        window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        return null
      }

      const data = (await res.json()) as ApiResponseBody
      if (data.accessToken) {
        setAccessToken(data.accessToken)
        // Se recebeu um novo refresh token, salva no localStorage como fallback
        if (data.refreshToken) {
          window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken)
        }
        return data.accessToken
      }
      setAccessToken(null)
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      return null
    } catch (error) {
      setAccessToken(null)
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      return null
    } finally {
      // Aguarda um pouco antes de liberar o lock para evitar race conditions
      // em ambientes com React Strict Mode (desenvolvimento)
      setTimeout(() => {
        refreshPromise = null
      }, 100)
    }
  })()

  return refreshPromise
}

/**
 * Revoga o refresh token no backend (cookie HttpOnly) e limpa memória.
 */
export async function revokeSession(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    /* ignore — logout é best-effort */
  } finally {
    setAccessToken(null)
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  }
}

async function apiFetch(
  path: string,
  body: object,
  options: { withToken?: boolean; _retried?: boolean } = {},
): Promise<AuthResult> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (options.withToken) {
      const token = getAccessToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    })

    // 401 em rota autenticada: tenta refresh uma única vez e refaz.
    if (res.status === 401 && options.withToken && !options._retried) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return apiFetch(path, body, { ...options, _retried: true })
      }
    }

    // Tenta extrair mensagem de erro estruturada; cai para texto puro se não for JSON.
    let data: ApiResponseBody | null = null
    let fallbackMessage: string | undefined
    try {
      data = (await res.json()) as ApiResponseBody
    } catch {
      fallbackMessage = `${res.status} ${res.statusText}`.trim()
    }

    if (!res.ok) {
      return {
        status: 'error',
        message: data?.message ?? fallbackMessage ?? 'Não foi possível concluir a operação.',
      }
    }

    return {
      status: data?.status ?? 'success',
      message: data?.message,
      session: data?.session,
      accessToken: data?.accessToken,
      ticket: data?.ticket,
    }
  } catch {
    return {
      status: 'error',
      message: 'Falha de comunicação com o servidor. Tente novamente.',
    }
  }
}

export const authService = {
  login(credentials: LoginCredentials): Promise<AuthResult> {
    return apiFetch('/auth/login', credentials)
  },

  login2fa(payload: Login2faPayload): Promise<AuthResult> {
    return apiFetch('/auth/login-2fa', payload)
  },

  register(payload: RegisterPayload): Promise<AuthResult> {
    return apiFetch('/auth/register', {
      fullName: payload.fullName,
      workEmail: payload.workEmail,
      password: payload.password,
    })
  },

  verifyEmail(payload: VerifyEmailPayload): Promise<AuthResult> {
    return apiFetch('/auth/verify-email', payload)
  },

  requestPasswordRecovery(payload: PasswordRecoveryPayload): Promise<AuthResult> {
    return apiFetch('/auth/password/recover', payload)
  },

  resetPassword(payload: ResetPasswordPayload): Promise<AuthResult> {
    return apiFetch('/auth/password/reset', payload)
  },
}
