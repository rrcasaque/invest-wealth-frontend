export type {
  WalletAssetType,
  WalletAsset,
  FixedIncomeAsset,
  CryptoAsset,
  RentalAsset,
} from '@/shared/types/wallet'

import type {
  CryptoAsset,
  FixedIncomeAsset,
  RentalAsset,
  WalletAssetType,
} from '@/shared/types/wallet'

/** Dados para criar um ativo de renda fixa. */
export interface FixedIncomeInput {
  type: 'renda-fixa'
  name: string
  institution: string
  amount: number
  rate: number
  maturity?: string
  notes?: string
}

/** Dados para criar um ativo de criptomoeda. */
export interface CryptoInput {
  type: 'cripto'
  name: string
  symbol: string
  quantity: number
  purchasePrice: number
  notes?: string
}

/** Dados para criar um ativo de aluguel. */
export interface RentalInput {
  type: 'aluguel'
  name: string
  propertyValue: number
  rentValue: number
  agencyFee: number
  notes?: string
}

/** Input de criação discriminado por tipo. */
export type WalletAssetInput = FixedIncomeInput | CryptoInput | RentalInput

/** Resumo agregado da carteira por tipo de ativo. */
export interface WalletSummary {
  /** Total investido/aplicado na carteira (soma dos valores aplicados). */
  totalInvested: number
  /** Renda mensal estimada (aluguéis líquidos da taxa). */
  monthlyIncome: number
  /** Contagem total de ativos. */
  totalAssets: number
  /** Valor aplicado por tipo de ativo. */
  byType: Record<WalletAssetType, { count: number; value: number }>
}

/** Valor "aplicado" em um ativo (para fins de agregação). */
export function getAssetInvestedValue(
  asset: FixedIncomeAsset | CryptoAsset | RentalAsset,
): number {
  switch (asset.type) {
    case 'renda-fixa':
      return asset.amount
    case 'cripto':
      return asset.quantity * asset.purchasePrice
    case 'aluguel':
      return asset.propertyValue
  }
}
