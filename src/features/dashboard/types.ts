export interface PortfolioSummary {
  totalValue: number
  /** Expectativa de rendimento mensal (aluguéis + renda fixa + dividendos B3). */
  monthlyIncome: number
  /** Rendimento mensal esperado por categoria (em BRL). */
  monthlyIncomeByCategory: Record<string, number>
  monthlyReturn: number
  beta: number
  returnYtd: number
  returnYtdValue: number
  currency: string
}

export interface AllocationSlice {
  id: string
  label: string
  percentage: number
  value: number
  color: string
}

export interface PerformancePoint {
  date: string
  value: number
}

export interface Transaction {
  id: string
  date: string
  asset: string
  type: 'Compra' | 'Venda'
  value: number
  status: 'Concluído' | 'Pendente'
}

export interface DashboardData {
  summary: PortfolioSummary
  allocation: AllocationSlice[]
  performance: PerformancePoint[]
  transactions: Transaction[]
}
