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

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface Login2faPayload {
  ticket: string
  code: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  newPassword: string
}

export interface AuthSession {
  userId: string
  email: string
  name: string
}

export type AuthStatus = 'idle' | 'submitting' | 'success' | 'error' | '2fa_required'

export interface AuthResult {
  status: AuthStatus
  message?: string
  session?: AuthSession
  accessToken?: string
  ticket?: string
}
