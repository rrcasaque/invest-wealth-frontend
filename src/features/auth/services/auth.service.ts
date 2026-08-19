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
  ticket?: string
}

/** Sinaliza que um refresh já está em andamento para evitar chamadas concorrentes. */
let refreshPromise: Promise<string | null> | null = null

/**
 * Chama /auth/refresh (cookie HttpOnly é enviado automaticamente) e
 * atualiza o access token em memória. Singleton: chamadas concorrentes
 * compartilham o mesmo promise.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        setAccessToken(null)
        return null
      }
      const data = (await res.json()) as ApiResponseBody
      if (data.accessToken) {
        setAccessToken(data.accessToken)
        return data.accessToken
      }
      setAccessToken(null)
      return null
    } catch {
      setAccessToken(null)
      return null
    } finally {
      // Libera o lock após microtasks drenarem.
      setTimeout(() => {
        refreshPromise = null
      }, 0)
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
