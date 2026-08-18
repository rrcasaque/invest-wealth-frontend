export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  workEmail: string
  password: string
}

export interface PasswordRecoveryPayload {
  email: string
}

export interface AuthSession {
  userId: string
  email: string
  name: string
}

export type AuthStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface AuthResult {
  status: AuthStatus
  message?: string
  session?: AuthSession
}
