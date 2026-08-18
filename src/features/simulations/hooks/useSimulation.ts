import { useCallback, useState } from 'react'
import { simulationService } from '../services/simulation.service'
import type { SimulationParameters, SimulationResult } from '../types'

export type SimulationStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseSimulationResult {
  result: SimulationResult | null
  status: SimulationStatus
  error: string | null
  run: (params: SimulationParameters) => Promise<void>
  reset: () => void
}

export function useSimulation(): UseSimulationResult {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [status, setStatus] = useState<SimulationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (params: SimulationParameters) => {
    setStatus('loading')
    setError(null)
    try {
      const value = await simulationService.run(params)
      setResult(value)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar a simulação.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { result, status, error, run, reset }
}
