import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, ResetPasswordPayload } from '../types'

export interface UseResetPasswordResult {
  status: AuthResult['status']
  message?: string
  submit: (payload: ResetPasswordPayload) => Promise<AuthResult>
  reset: () => void
}

export function useResetPassword(): UseResetPasswordResult {
  const [state, setState] = useState<AuthResult>({ status: 'idle' })

  const submit = async (payload: ResetPasswordPayload): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.resetPassword(payload)
    setState(result)
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return { status: state.status, message: state.message, submit, reset }
}
