import { useState, useCallback } from 'react'
import type { BenchmarkKey } from '../types'

export interface UseBenchmarkVisibilityResult {
  visible: Record<BenchmarkKey, boolean>
  toggle: (key: BenchmarkKey) => void
  setVisible: (key: BenchmarkKey, visible: boolean) => void
}

export function useBenchmarkVisibility(
  initial: Record<BenchmarkKey, boolean> = {
    portfolio: true,
    cdi: true,
    ibovespa: true,
    ifix: true,
  },
): UseBenchmarkVisibilityResult {
  const [visible, setVisibleState] = useState<Record<BenchmarkKey, boolean>>(initial)

  const toggle = useCallback((key: BenchmarkKey) => {
    setVisibleState((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  const setVisible = useCallback((key: BenchmarkKey, value: boolean) => {
    setVisibleState((current) => ({ ...current, [key]: value }))
  }, [])

  return { visible, toggle, setVisible }
}
