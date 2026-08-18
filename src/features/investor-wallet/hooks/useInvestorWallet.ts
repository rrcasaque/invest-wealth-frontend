import { useCallback, useEffect, useState } from 'react'
import { investorWalletService } from '../services/investor-wallet.service'
import type {
  WalletAsset,
  WalletAssetInput,
  WalletSummary,
} from '../types'
import {
  getStoredPositions,
  getStoredPortfolioMeta,
} from '@/shared/storage/portfolio-storage'
import type { PortfolioPosition } from '@/shared/types/portfolio'

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
  refresh: () => Promise<void>
}

export function useInvestorWallet(): UseInvestorWalletResult {
  const [assets, setAssets] = useState<WalletAsset[]>([])
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [b3Positions, setB3Positions] = useState<PortfolioPosition[]>([])
  const [b3Meta, setB3Meta] = useState<
    { fileName: string; importedAt: string } | null
  >(null)
  const [status, setStatus] = useState<InvestorWalletStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        investorWalletService.list(),
        investorWalletService.summarize(),
      ])
      setAssets(list)
      setSummary(sum)
      setB3Positions(getStoredPositions())
      setB3Meta(getStoredPortfolioMeta())
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar a carteira.')
      setStatus('error')
    }
  }, [])

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
