import { useEffect, useState } from 'react'
import { performanceService } from '../services/performance.service'
import type { AssetClass, PerformanceData, PerformancePeriod } from '../types'

export type PerformanceStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UsePerformanceFiltersResult {
  data: PerformanceData | null
  status: PerformanceStatus
  error: string | null
  period: PerformancePeriod
  assetClass: AssetClass
  setPeriod: (period: PerformancePeriod) => void
  setAssetClass: (assetClass: AssetClass) => void
}

export function usePerformanceFilters(
  initialPeriod: PerformancePeriod = 'YTD',
): UsePerformanceFiltersResult {
  const [period, setPeriod] = useState<PerformancePeriod>(initialPeriod)
  const [assetClass, setAssetClass] = useState<AssetClass>('all')
  const [data, setData] = useState<PerformanceData | null>(null)
  const [status, setStatus] = useState<PerformanceStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setStatus('loading')
    performanceService
      .getPerformanceData(period)
      .then((result) => {
        if (!active) return
        setData(result)
        setStatus('success')
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Falha ao carregar desempenho.')
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [period])

  return { data, status, error, period, assetClass, setPeriod, setAssetClass }
}
