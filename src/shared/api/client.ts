import { getAccessToken, refreshAccessToken } from '@/features/auth/services/auth.service'

const API_URL = import.meta.env.VITE_API_URL ?? ''

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; retry?: boolean }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 401 && options.retry !== false) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiRequest<T>(path, { ...options, retry: false })
  }

  const payload = await response.json().catch(() => null) as { message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.message ?? `Erro na API (${response.status}).`)
  }
  return payload as T
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T = void>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}
