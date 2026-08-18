import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, PasswordRecoveryPayload } from '../types'

export interface UsePasswordRecoveryResult {
  status: AuthResult['status']
  message?: string
  submittedEmail?: string
  submit: (payload: PasswordRecoveryPayload) => Promise<AuthResult>
  reset: () => void
}

export function usePasswordRecovery(): UsePasswordRecoveryResult {
  const [state, setState] = useState<AuthResult & { submittedEmail?: string }>({
    status: 'idle',
  })

  const submit = async (payload: PasswordRecoveryPayload): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.requestPasswordRecovery(payload)
    setState({ ...result, submittedEmail: payload.email })
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return {
    status: state.status,
    message: state.message,
    submittedEmail: state.submittedEmail,
    submit,
    reset,
  }
}
