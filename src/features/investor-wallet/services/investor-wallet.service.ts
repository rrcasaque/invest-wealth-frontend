import type {
  WalletAsset,
  WalletAssetInput,
  WalletSummary,
} from '../types'
import { getAssetInvestedValue } from '../types'
import { getStoredWalletAssets, storeWalletAssets } from '@/shared/storage/wallet-storage'

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function read(): WalletAsset[] {
  return getStoredWalletAssets()
}

function write(assets: WalletAsset[]): void {
  storeWalletAssets(assets)
}

/**
 * Serviço da Carteira de Investidor.
 *
 * Persiste os ativos em localStorage. Os métodos são async para
 * manter compatibilidade com a interface do hook e simular latência.
 */
class InvestorWalletService {
  async list(): Promise<WalletAsset[]> {
    await delay(150)
    return [...read()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async create(input: WalletAssetInput): Promise<WalletAsset> {
    await delay(200)
    const asset: WalletAsset = {
      id: uuid(),
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    } as WalletAsset
    const assets = read()
    assets.push(asset)
    write(assets)
    return asset
  }

  async remove(id: string): Promise<void> {
    await delay(100)
    write(read().filter((a) => a.id !== id))
  }

  async summarize(): Promise<WalletSummary> {
    await delay(100)
    const assets = read()
    const summary: WalletSummary = {
      totalInvested: 0,
      monthlyIncome: 0,
      totalAssets: assets.length,
      byType: {
        'renda-fixa': { count: 0, value: 0 },
        cripto: { count: 0, value: 0 },
        aluguel: { count: 0, value: 0 },
      },
    }
    for (const asset of assets) {
      const value = getAssetInvestedValue(asset)
      summary.totalInvested += value
      summary.byType[asset.type].count += 1
      summary.byType[asset.type].value += value
      if (asset.type === 'aluguel') {
        const net = asset.rentValue * (1 - asset.agencyFee / 100)
        summary.monthlyIncome += Math.max(0, net)
      }
    }
    return summary
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const investorWalletService = new InvestorWalletService()
