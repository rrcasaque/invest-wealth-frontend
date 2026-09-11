import { api } from '@/shared/api/client'
import { getStoredWalletAssets, clearWalletAssets } from '@/shared/storage/wallet-storage'
import { getStoredPositions, getStoredPortfolioMeta, clearPortfolio } from '@/shared/storage/portfolio-storage'
import { getStoredPayments, clearPayments } from '@/shared/storage/payment-storage'
import type { WalletAsset } from '@/shared/types/wallet'
import type { PaymentReminder } from '@/shared/types/payment'

function walletPayload(asset: WalletAsset): Record<string, unknown> {
  if (asset.type === 'renda-fixa') {
    return {
      type: 'RENDA_FIXA', name: asset.name, notes: asset.notes,
      fixedIncomeInstitution: asset.institution, fixedIncomeAmount: asset.amount,
      fixedIncomeRate: asset.rate, maturity: asset.maturity,
    }
  }
  if (asset.type === 'cripto') {
    return {
      type: 'CRIPTO', name: asset.name, notes: asset.notes, ticker: asset.symbol,
      quantity: asset.quantity, purchasePrice: asset.purchasePrice,
    }
  }
  if (asset.type === 'aluguel') {
    return {
      type: 'ALUGUEL', name: asset.name, notes: asset.notes,
      propertyValue: asset.propertyValue, rentValue: asset.rentValue, agencyFee: asset.agencyFee,
    }
  }
  return {
    type: asset.type === 'fii' ? 'FII' : 'ACAO', name: asset.name, ticker: asset.ticker,
    cnpj: asset.cnpj, notes: asset.notes, institution: asset.institution,
    quantity: asset.quantity, purchasePrice: asset.purchasePrice,
    currentPrice: asset.currentPrice, currentValue: asset.currentValue,
  }
}

function paymentPayload(payment: PaymentReminder): Record<string, unknown> {
  return {
    title: payment.title,
    notes: payment.notes,
    category: payment.category.toUpperCase(),
    amount: payment.amount,
    dueDate: payment.dueDate,
    priority: payment.priority.toUpperCase(),
    recurrence: payment.recurrence.toUpperCase(),
    paymentMethod: payment.paymentMethod,
    receipt: payment.receipt,
  }
}

let migrationPromise: Promise<void> | null = null

export function migrateLocalData(): Promise<void> {
  if (migrationPromise) return migrationPromise
  migrationPromise = (async () => {
    const localAssets = getStoredWalletAssets()
    for (const asset of localAssets) {
      await api.post('/wallet/assets', walletPayload(asset))
    }
    if (localAssets.length > 0) clearWalletAssets()

    const positions = getStoredPositions()
    if (positions.length > 0) {
      const meta = getStoredPortfolioMeta()
      await api.post('/wallet/import/b3', {
        fileName: meta?.fileName ?? 'local-storage-import',
        importedAt: meta?.importedAt ?? new Date().toISOString(),
        positions,
      })
      clearPortfolio()
    }

    const payments = getStoredPayments()
    for (const payment of payments) {
      const created = await api.post<{ id: number }>('/payments', paymentPayload(payment))
      if (payment.status === 'paid') {
        await api.patch(`/payments/${created.id}/pay`, {
          paymentMethod: payment.paymentMethod,
          receipt: payment.receipt,
        })
      }
    }
    if (payments.length > 0) clearPayments()
  })().finally(() => {
    migrationPromise = null
  })
  return migrationPromise
}
