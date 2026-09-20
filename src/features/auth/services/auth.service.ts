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

/** 
 * Sinaliza que um refresh já está em andamento para evitar chamadas concorrentes.
 * Mantido por tempo suficiente para lidar com React Strict Mode (desenvolvimento).
 */
let refreshPromise: Promise<string | null> | null = null
let refreshPromiseTimestamp = 0
let refreshPromiseClearTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Tempo mínimo (ms) para manter o singleton refreshPromise ativo.
 * Previne múltiplas chamadas simultâneas causadas por React Strict Mode.
 */
const REFRESH_SINGLETON_MIN_DURATION_MS = 2000

/**
 * Chama /auth/refresh (cookie HttpOnly é enviado automaticamente) e
 * atualiza o access token em memória. Singleton: chamadas concorrentes
 * compartilham o mesmo promise e o resultado é cacheado por um período mínimo.
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
  if (refreshPromise) {
    const elapsed = Date.now() - refreshPromiseTimestamp
    // Se ainda está dentro do período mínimo, retorna o mesmo promise
    if (elapsed < REFRESH_SINGLETON_MIN_DURATION_MS) {
      return refreshPromise
    }
  }

  // Cancela qualquer timeout pendente
  if (refreshPromiseClearTimeout) {
    clearTimeout(refreshPromiseClearTimeout)
    refreshPromiseClearTimeout = null
  }

  // Marca o timestamp de início
  refreshPromiseTimestamp = Date.now()

  refreshPromise = (async () => {
    try {
      // Tenta usar o cookie HttpOnly primeiro (método preferido)
      console.log('[Auth] Tentando refresh com cookie HttpOnly...')
      let res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      // Se falhar e houver um refresh token no localStorage (fallback), tenta usar
      if (!res.ok) {
        console.log('[Auth] Refresh com cookie falhou, tentando fallback do localStorage...')
        const fallbackToken = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
        if (fallbackToken) {
          console.log('[Auth] Token fallback encontrado, enviando via header X-Refresh-Token')
          res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Refresh-Token': fallbackToken,
            },
          })
        } else {
          console.log('[Auth] Nenhum token fallback encontrado no localStorage')
        }
      } else {
        console.log('[Auth] Refresh com cookie HttpOnly bem-sucedido!')
      }

      if (!res.ok) {
        console.error('[Auth] Refresh falhou completamente:', res.status, res.statusText)
        setAccessToken(null)
        window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        return null
      }

      const data = (await res.json()) as ApiResponseBody
      if (data.accessToken) {
        console.log('[Auth] Access token renovado com sucesso')
        setAccessToken(data.accessToken)
        // Se recebeu um novo refresh token, salva no localStorage como fallback
        if (data.refreshToken) {
          console.log('[Auth] Novo refresh token recebido, salvando no localStorage')
          window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken)
        }
        return data.accessToken
      }
      console.error('[Auth] Resposta não contém accessToken')
      setAccessToken(null)
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      return null
    } catch (error) {
      console.error('[Auth] Erro durante refresh:', error)
      setAccessToken(null)
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      return null
    } finally {
      // Calcula quanto tempo ainda falta para completar o período mínimo
      const elapsed = Date.now() - refreshPromiseTimestamp
      const remainingTime = Math.max(0, REFRESH_SINGLETON_MIN_DURATION_MS - elapsed)

      // Agenda a limpeza do singleton após o período mínimo
      refreshPromiseClearTimeout = setTimeout(() => {
        refreshPromise = null
        refreshPromiseTimestamp = 0
        refreshPromiseClearTimeout = null
      }, remainingTime)
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

    // Limpa o singleton de refresh
    if (refreshPromiseClearTimeout) {
      clearTimeout(refreshPromiseClearTimeout)
      refreshPromiseClearTimeout = null
    }
    refreshPromise = null
    refreshPromiseTimestamp = 0
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
