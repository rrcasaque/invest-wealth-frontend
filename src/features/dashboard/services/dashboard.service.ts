import type { DashboardData, PortfolioSummary, AllocationSlice, PerformancePoint, Transaction } from '../types'
import { getStoredPositions } from '@/shared/storage/portfolio-storage'
import { getStoredPayments } from '@/shared/storage/payment-storage'
import { getStoredWalletAssets } from '@/shared/storage/wallet-storage'
import type { WalletAsset } from '@/shared/types/wallet'
import type { PortfolioPosition } from '@/shared/types/portfolio'
import type { PaymentReminder } from '@/shared/types/payment'

/** Categorias de ativo exibidas no dashboard. */
type DashboardCategory = 'b3' | 'renda-fixa' | 'cripto' | 'aluguel'

/** Dividend yield mensal hardcoded da carteira B3 (FIIs). */
const B3_MONTHLY_DIVIDEND_YIELD = 0.008

const CATEGORY_META: Record<
  DashboardCategory,
  { label: string; color: string }
> = {
  b3: { label: 'Carteira B3', color: 'hsl(var(--primary))' },
  'renda-fixa': { label: 'Renda Fixa', color: 'hsl(210 80% 55%)' },
  cripto: { label: 'Criptomoedas', color: 'hsl(40 85% 55%)' },
  aluguel: { label: 'Aluguéis', color: 'hsl(145 60% 45%)' },
}

const CATEGORY_ORDER: DashboardCategory[] = ['b3', 'renda-fixa', 'cripto', 'aluguel']

/** Valor aplicado em um ativo da carteira (espelha getAssetInvestedValue do shared). */
function walletAssetValue(asset: WalletAsset): number {
  switch (asset.type) {
    case 'renda-fixa':
      return asset.amount
    case 'cripto':
      return asset.quantity * asset.purchasePrice
    case 'aluguel':
      return asset.propertyValue
  }
}

/** Expectativa de rendimento mensal de um ativo da carteira. */
function walletAssetMonthlyIncome(asset: WalletAsset): number {
  switch (asset.type) {
    case 'renda-fixa':
      // Taxa % a.a. convertida para mensal pro-rata.
      return (asset.amount * asset.rate) / 100 / 12
    case 'aluguel':
      // Aluguel líquido da taxa da imobiliária (%).
      return Math.max(0, asset.rentValue * (1 - asset.agencyFee / 100))
    case 'cripto':
      // Cripto não gera rendimento periódico (apenas valorização).
      return 0
  }
}

function buildCategoryAllocation(
  positions: PortfolioPosition[],
  walletAssets: WalletAsset[],
): AllocationSlice[] {
  const totals: Record<DashboardCategory, number> = {
    b3: 0,
    'renda-fixa': 0,
    cripto: 0,
    aluguel: 0,
  }

  for (const p of positions) totals.b3 += p.value
  for (const a of walletAssets) {
    totals[a.type] += walletAssetValue(a)
  }

  const total = CATEGORY_ORDER.reduce((sum, c) => sum + totals[c], 0)
  if (total === 0) return []

  return CATEGORY_ORDER.filter((c) => totals[c] > 0)
    .map((c) => ({
      id: c,
      label: CATEGORY_META[c].label,
      percentage: Math.round((totals[c] / total) * 1000) / 10,
      value: totals[c],
      color: CATEGORY_META[c].color,
    }))
    .sort((a, b) => b.value - a.value)
}

function buildPerformanceSeries(totalValue: number): PerformancePoint[] {
  // Linha contínua: valor constante no total atual ao longo de 12 meses
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const year = new Date().getFullYear()
  return months.map((month) => ({
    date: `${month}/${year}`,
    value: totalValue,
  }))
}

function buildTransactions(payments: PaymentReminder[]): Transaction[] {
  return payments
    .slice()
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, 8)
    .map((payment) => ({
      id: payment.id,
      date: payment.dueDate,
      asset: payment.title,
      type: 'Compra' as const,
      value: payment.amount,
      status: payment.status === 'paid' ? 'Concluído' : 'Pendente',
    }))
}

function buildSummary(
  positions: PortfolioPosition[],
  walletAssets: WalletAsset[],
  payments: PaymentReminder[],
): PortfolioSummary {
  const b3Value = positions.reduce((sum, p) => sum + p.value, 0)
  const walletValue = walletAssets.reduce((sum, a) => sum + walletAssetValue(a), 0)
  const totalValue = b3Value + walletValue

  // Renda mensal por categoria
  const b3Income = b3Value * B3_MONTHLY_DIVIDEND_YIELD
  const rendaFixaIncome = walletAssets
    .filter((a) => a.type === 'renda-fixa')
    .reduce((sum, a) => sum + walletAssetMonthlyIncome(a), 0)
  const aluguelIncome = walletAssets
    .filter((a) => a.type === 'aluguel')
    .reduce((sum, a) => sum + walletAssetMonthlyIncome(a), 0)

  const monthlyIncomeByCategory: Record<string, number> = {
    b3: b3Income,
    'renda-fixa': rendaFixaIncome,
    aluguel: aluguelIncome,
  }
  const monthlyIncome = b3Income + rendaFixaIncome + aluguelIncome

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthPayments = payments.filter((p) => p.dueDate.startsWith(currentMonth))
  const pendingAmount = monthPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0)

  return {
    totalValue,
    monthlyIncome,
    monthlyIncomeByCategory,
    monthlyReturn: pendingAmount,
    beta: 0,
    returnYtd: 0,
    returnYtdValue: 0,
    currency: 'BRL',
  }
}

/**
 * Serviço do Painel.
 *
 * Deriva todos os dados do localStorage:
 * - Posições da carteira (importadas da B3)
 * - Ativos da carteira de investidor (renda fixa, cripto, aluguel)
 * - Lembretes de pagamento
 */
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const positions = getStoredPositions()
    const walletAssets = getStoredWalletAssets()
    const payments = getStoredPayments()

    const totalValue =
      positions.reduce((sum, p) => sum + p.value, 0) +
      walletAssets.reduce((sum, a) => sum + walletAssetValue(a), 0)

    return {
      summary: buildSummary(positions, walletAssets, payments),
      allocation: buildCategoryAllocation(positions, walletAssets),
      performance: buildPerformanceSeries(totalValue),
      transactions: buildTransactions(payments),
    }
  },
}
