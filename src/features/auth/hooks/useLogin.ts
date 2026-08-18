import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, LoginCredentials } from '../types'

export interface UseLoginResult {
  status: AuthResult['status']
  message?: string
  submit: (credentials: LoginCredentials) => Promise<AuthResult>
  reset: () => void
}

export function useLogin(): UseLoginResult {
  const [state, setState] = useState<AuthResult>({ status: 'idle' })

  const submit = async (credentials: LoginCredentials): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.login(credentials)
    setState(result)
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return { status: state.status, message: state.message, submit, reset }
}
