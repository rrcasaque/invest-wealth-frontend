export type PerformancePeriod = '1M' | '6M' | 'YTD' | '1A' | '3A' | 'MAX'

export type AssetClass = 'all' | 'stocks' | 'fixed-income' | 'crypto'

export type BenchmarkKey = 'portfolio' | 'cdi' | 'ibovespa' | 'ifix'

export interface PerformancePoint {
  date: string
  portfolio: number
  cdi: number
  ibovespa: number
  ifix: number
}

export interface PerformanceMetric {
  id: string
  label: string
  value: string
  hint?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface BenchmarkDetail {
  id: BenchmarkKey
  name: string
  tag: string
  value: string
  period: string
  spread: string
}

export interface PerformanceData {
  metrics: PerformanceMetric[]
  series: PerformancePoint[]
  benchmarks: BenchmarkDetail[]
}
