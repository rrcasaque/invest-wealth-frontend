import type { WalletAssetType } from '../types'

export const walletTypeLabel: Record<WalletAssetType, string> = {
  'renda-fixa': 'Renda Fixa',
  cripto: 'Criptomoeda',
  aluguel: 'Aluguel',
}

export const walletTypeColor: Record<WalletAssetType, string> = {
  'renda-fixa': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cripto: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  aluguel: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}
