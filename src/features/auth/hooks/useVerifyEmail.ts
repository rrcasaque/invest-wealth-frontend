import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, VerifyEmailPayload } from '../types'

export interface UseVerifyEmailResult {
  status: AuthResult['status']
  message?: string
  submit: (payload: VerifyEmailPayload) => Promise<AuthResult>
  reset: () => void
}

export function useVerifyEmail(): UseVerifyEmailResult {
  const [state, setState] = useState<AuthResult>({ status: 'idle' })

  const submit = async (payload: VerifyEmailPayload): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.verifyEmail(payload)
    setState(result)
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return { status: state.status, message: state.message, submit, reset }
}
