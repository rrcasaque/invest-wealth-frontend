import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboard.service'
import type { DashboardData } from '../types'

export type DashboardStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UsePortfolioSummaryResult {
  data: DashboardData | null
  status: DashboardStatus
  error: string | null
  refetch: () => void
}

export function usePortfolioSummary(deps: unknown[] = []): UsePortfolioSummaryResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [status, setStatus] = useState<DashboardStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    setStatus('loading')
    dashboardService
      .getDashboardData()
      .then((result) => {
        if (!active) return
        setData(result)
        setStatus('success')
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Falha ao carregar o painel.')
        setStatus('error')
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps])

  return { data, status, error, refetch: () => setNonce((n) => n + 1) }
}
