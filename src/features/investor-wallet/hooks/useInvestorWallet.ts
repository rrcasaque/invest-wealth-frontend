import { useCallback, useEffect, useState } from 'react'
import { investorWalletService } from '../services/investor-wallet.service'
import type {
  WalletAsset,
  WalletAssetInput,
  WalletSummary,
} from '../types'
import type { PortfolioPosition } from '@/shared/types/portfolio'
import type { MarketAsset } from '@/shared/types/wallet'
import {
  getOrFetchExpectativeDividendMonth,
  StatusInvestScrapingError,
} from '@/shared/services/expectative-dividend.service'
import { useToast } from '@/shared/ui/toast'

export type InvestorWalletStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseInvestorWalletResult {
  assets: WalletAsset[]
  summary: WalletSummary | null
  /** Posições importadas da B3 (localStorage investwealth-portfolio). */
  b3Positions: PortfolioPosition[]
  /** Valor total das posições B3. */
  b3TotalValue: number
  /** Metadados da importação B3 (nome do arquivo + data). */
  b3Meta: { fileName: string; importedAt: string } | null
  status: InvestorWalletStatus
  error: string | null
  create: (input: WalletAssetInput) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: (forceDividendRefresh?: boolean) => Promise<void>
}

export function useInvestorWallet(): UseInvestorWalletResult {
  const { toast } = useToast()
  const [assets, setAssets] = useState<WalletAsset[]>([])
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [b3Positions, setB3Positions] = useState<PortfolioPosition[]>([])
  const [b3Meta, setB3Meta] = useState<
    { fileName: string; importedAt: string } | null
  >(null)
  const [status, setStatus] = useState<InvestorWalletStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (forceDividendRefresh = false) => {
    setStatus('loading')
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        investorWalletService.list(),
        investorWalletService.summarize(),
      ])
      setAssets(list)
      setSummary(sum)
      const positions = (list
        .filter((asset) => asset.type === 'fii' || asset.type === 'acao') as MarketAsset[])
        .map((asset) => ({
          ticker: asset.ticker,
          product: asset.name,
          cnpj: asset.cnpj ?? '',
          institution: asset.institution ?? '',
          shares: asset.quantity,
          price: asset.currentPrice ?? 0,
          value: asset.currentValue ?? 0,
        }))
      setB3Positions(positions)
      setB3Meta(null)
      await getOrFetchExpectativeDividendMonth(forceDividendRefresh, positions)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar a carteira.')
      setStatus('error')
      if (err instanceof StatusInvestScrapingError) {
        toast({
          title: 'Falha ao atualizar a carteira',
          description: err.message,
          variant: 'destructive',
        })
      }
    }
  }, [toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: WalletAssetInput) => {
      await investorWalletService.create(input)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await investorWalletService.remove(id)
      await refresh()
    },
    [refresh],
  )

  const b3TotalValue = b3Positions.reduce((sum, p) => sum + p.value, 0)

  return {
    assets,
    summary,
    b3Positions,
    b3TotalValue,
    b3Meta,
    status,
    error,
    create,
    remove,
    refresh,
  }
}
