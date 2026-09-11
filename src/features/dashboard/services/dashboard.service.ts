import type { DashboardData, PortfolioSummary, AllocationSlice, PerformancePoint, Transaction } from '../types'
import { investorWalletService } from '@/features/investor-wallet/services/investor-wallet.service'
import type { WalletAsset } from '@/shared/types/wallet'
import type { PortfolioPosition } from '@/shared/types/portfolio'
import type { PaymentReminder } from '@/shared/types/payment'
import type { ExpectativeDividendMonth } from '@/shared/types/expectative-dividend'
import { paymentAssistantService } from '@/features/payment-assistant/services/payment-assistant.service'
import { getOrFetchExpectativeDividendMonth } from '@/shared/services/expectative-dividend.service'

type DashboardCategory = 'b3' | 'renda-fixa' | 'cripto' | 'aluguel'

const CATEGORY_META: Record<DashboardCategory, { label: string; color: string }> = {
  b3: { label: 'Carteira B3', color: 'hsl(var(--primary))' },
  'renda-fixa': { label: 'Renda Fixa', color: 'hsl(210 80% 55%)' },
  cripto: { label: 'Criptomoedas', color: 'hsl(40 85% 55%)' },
  aluguel: { label: 'Aluguéis', color: 'hsl(145 60% 45%)' },
}

const CATEGORY_ORDER: DashboardCategory[] = ['b3', 'renda-fixa', 'cripto', 'aluguel']

function walletAssetValue(asset: WalletAsset): number {
  switch (asset.type) {
    case 'fii':
    case 'acao':
      return asset.currentValue ?? asset.quantity * (asset.purchasePrice ?? 0)
    case 'renda-fixa':
      return asset.amount
    case 'cripto':
      return asset.quantity * asset.purchasePrice
    case 'aluguel':
      return asset.propertyValue
  }
}

function walletAssetMonthlyIncome(asset: WalletAsset): number {
  switch (asset.type) {
    case 'renda-fixa':
      return (asset.amount * asset.rate) / 100 / 12
    case 'aluguel':
      return Math.max(0, asset.rentValue * (1 - asset.agencyFee / 100))
    default:
      return 0
  }
}

function toPortfolioPositions(assets: WalletAsset[]): PortfolioPosition[] {
  return assets
    .filter((asset): asset is Extract<WalletAsset, { type: 'fii' | 'acao' }> => asset.type === 'fii' || asset.type === 'acao')
    .map((asset) => ({
      ticker: asset.ticker,
      product: asset.name,
      cnpj: asset.cnpj ?? '',
      institution: asset.institution ?? '',
      shares: asset.quantity,
      price: asset.currentPrice ?? 0,
      value: asset.currentValue ?? 0,
    }))
}

function buildCategoryAllocation(walletAssets: WalletAsset[]): AllocationSlice[] {
  const totals: Record<DashboardCategory, number> = {
    b3: 0,
    'renda-fixa': 0,
    cripto: 0,
    aluguel: 0,
  }

  for (const asset of walletAssets) {
    const category: DashboardCategory = asset.type === 'fii' || asset.type === 'acao' ? 'b3' : asset.type
    totals[category] += walletAssetValue(asset)
  }

  const total = CATEGORY_ORDER.reduce((sum, category) => sum + totals[category], 0)
  if (total === 0) return []

  return CATEGORY_ORDER.filter((category) => totals[category] > 0)
    .map((category) => ({
      id: category,
      label: CATEGORY_META[category].label,
      percentage: Math.round((totals[category] / total) * 1000) / 10,
      value: totals[category],
      color: CATEGORY_META[category].color,
    }))
    .sort((a, b) => b.value - a.value)
}

function buildPerformanceSeries(totalValue: number): PerformancePoint[] {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const year = new Date().getFullYear()
  return months.map((month) => ({ date: `${month}/${year}`, value: totalValue }))
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
  walletAssets: WalletAsset[],
  payments: PaymentReminder[],
  dividendExpectation: ExpectativeDividendMonth,
): PortfolioSummary {
  const totalValue = walletAssets.reduce((sum, asset) => sum + walletAssetValue(asset), 0)
  const b3Income = dividendExpectation.dividendTotal
  const rendaFixaIncome = walletAssets
    .filter((asset) => asset.type === 'renda-fixa')
    .reduce((sum, asset) => sum + walletAssetMonthlyIncome(asset), 0)
  const aluguelIncome = walletAssets
    .filter((asset) => asset.type === 'aluguel')
    .reduce((sum, asset) => sum + walletAssetMonthlyIncome(asset), 0)
  const monthlyIncomeByCategory: Record<string, number> = {
    b3: b3Income,
    'renda-fixa': rendaFixaIncome,
    aluguel: aluguelIncome,
  }
  const currentMonth = new Date().toISOString().slice(0, 7)
  const pendingAmount = payments
    .filter((payment) => payment.dueDate.startsWith(currentMonth) && (payment.status === 'pending' || payment.status === 'overdue'))
    .reduce((sum, payment) => sum + payment.amount, 0)

  return {
    totalValue,
    monthlyIncome: b3Income + rendaFixaIncome + aluguelIncome,
    monthlyIncomeByCategory,
    monthlyReturn: pendingAmount,
    beta: 0,
    returnYtd: 0,
    returnYtdValue: 0,
    currency: 'BRL',
  }
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const [walletAssets, payments] = await Promise.all([
      investorWalletService.list(),
      paymentAssistantService.list(),
    ])
    const positions = toPortfolioPositions(walletAssets)
    const dividendExpectation = await getOrFetchExpectativeDividendMonth(false, positions)
    const totalValue = walletAssets.reduce((sum, asset) => sum + walletAssetValue(asset), 0)

    return {
      summary: buildSummary(walletAssets, payments, dividendExpectation),
      allocation: buildCategoryAllocation(walletAssets),
      performance: buildPerformanceSeries(totalValue),
      transactions: buildTransactions(payments),
    }
  },
}
