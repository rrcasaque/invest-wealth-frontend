import { useCallback, useState } from 'react'
import { portfolioBalancingService } from '../services/portfolio-balancing.service'
import type { BalancingInput, BalancingResult } from '../types'

export type BalancingStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UsePortfolioBalancingResult {
  result: BalancingResult | null
  status: BalancingStatus
  error: string | null
  calculate: (input: BalancingInput) => Promise<void>
  reset: () => void
}

export function usePortfolioBalancing(): UsePortfolioBalancingResult {
  const [result, setResult] = useState<BalancingResult | null>(null)
  const [status, setStatus] = useState<BalancingStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback(async (input: BalancingInput) => {
    setStatus('loading')
    setError(null)
    try {
      const value = await portfolioBalancingService.calculate(input)
      setResult(value)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao calcular a distribuição.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { result, status, error, calculate, reset }
}
