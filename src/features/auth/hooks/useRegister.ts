import { useState } from 'react'
import { authService } from '../services/auth.service'
import type { AuthResult, RegisterPayload } from '../types'

export interface UseRegisterResult {
  status: AuthResult['status']
  message?: string
  submit: (payload: RegisterPayload) => Promise<AuthResult>
  reset: () => void
}

export function useRegister(): UseRegisterResult {
  const [state, setState] = useState<AuthResult>({ status: 'idle' })

  const submit = async (payload: RegisterPayload): Promise<AuthResult> => {
    setState({ status: 'submitting' })
    const result = await authService.register(payload)
    setState(result)
    return result
  }

  const reset = () => setState({ status: 'idle' })

  return { status: state.status, message: state.message, submit, reset }
}
