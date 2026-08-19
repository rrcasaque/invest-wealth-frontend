import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, Login2faPayload } from '../types'

export interface UseLogin2faResult {
  status: AuthResult['status']
  message?: string
  submit: (payload: Login2faPayload) => Promise<AuthResult>
  reset: () => void
}

export function useLogin2fa(): UseLogin2faResult {
  const [state, setState] = useState<AuthResult>({ status: 'idle' })

  const submit = async (payload: Login2faPayload): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.login2fa(payload)
    setState(result)
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return { status: state.status, message: state.message, submit, reset }
}
