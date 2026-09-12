import { api } from '@/shared/api/client'
import type { PortfolioImportResult, PortfolioPosition } from '@/shared/types/portfolio'
import type { WalletAsset, WalletAssetInput, WalletSummary } from '../types'

interface ApiAsset {
  id: number
  userId: number
  type: 'FII' | 'ACAO' | 'RENDA_FIXA' | 'CRIPTO' | 'ALUGUEL'
  name: string
  ticker: string | null
  cnpj: string | null
  notes: string | null
  institution: string | null
  quantity: number | string | null
  purchasePrice: number | string | null
  currentPrice: number | string | null
  currentValue: number | string | null
  acquiredAt: string | null
  createdAt: string
  fixedIncomeInstitution: string | null
  fixedIncomeAmount: number | string | null
  fixedIncomeRate: number | string | null
  maturity: string | null
  propertyValue: number | string | null
  rentValue: number | string | null
  agencyFee: number | string | null
}

interface ApiSummary {
  totalInvested: number
  monthlyIncome: number
  totalAssets: number
  byType: Record<string, { count: number; value: number }>
}

function number(value: number | string | null | undefined): number {
  return value === null || value === undefined ? 0 : Number(value)
}

function dateOnly(value: string | null): string | undefined {
  return value ? value.slice(0, 10) : undefined
}

function mapAsset(asset: ApiAsset): WalletAsset {
  const common = {
    id: String(asset.id),
    name: asset.name,
    notes: asset.notes ?? undefined,
    createdAt: dateOnly(asset.createdAt) ?? new Date().toISOString().slice(0, 10),
  }

  if (asset.type === 'FII' || asset.type === 'ACAO') {
    return {
      ...common,
      type: asset.type === 'FII' ? 'fii' : 'acao',
      ticker: asset.ticker ?? '',
      cnpj: asset.cnpj ?? undefined,
      institution: asset.institution ?? undefined,
      quantity: number(asset.quantity),
      purchasePrice: asset.purchasePrice === null ? undefined : number(asset.purchasePrice),
      currentPrice: asset.currentPrice === null ? undefined : number(asset.currentPrice),
      currentValue: asset.currentValue === null ? undefined : number(asset.currentValue),
    }
  }

  if (asset.type === 'RENDA_FIXA') {
    return {
      ...common,
      type: 'renda-fixa',
      institution: asset.fixedIncomeInstitution ?? asset.institution ?? '',
      amount: number(asset.fixedIncomeAmount),
      rate: number(asset.fixedIncomeRate),
      maturity: dateOnly(asset.maturity),
    }
  }

  if (asset.type === 'CRIPTO') {
    return {
      ...common,
      type: 'cripto',
      symbol: asset.ticker ?? '',
      quantity: number(asset.quantity),
      purchasePrice: number(asset.purchasePrice),
    }
  }

  return {
    ...common,
    type: 'aluguel',
    propertyValue: number(asset.propertyValue),
    rentValue: number(asset.rentValue),
    agencyFee: number(asset.agencyFee),
  }
}

function toApiInput(input: WalletAssetInput): Record<string, unknown> {
  if (input.type === 'renda-fixa') {
    return {
      type: 'RENDA_FIXA',
      name: input.name,
      notes: input.notes,
      fixedIncomeInstitution: input.institution,
      fixedIncomeAmount: input.amount,
      fixedIncomeRate: input.rate,
      maturity: input.maturity,
    }
  }
  if (input.type === 'cripto') {
    return {
      type: 'CRIPTO',
      name: input.name,
      notes: input.notes,
      ticker: input.symbol,
      quantity: input.quantity,
      purchasePrice: input.purchasePrice,
    }
  }
  return {
    type: 'ALUGUEL',
    name: input.name,
    notes: input.notes,
    propertyValue: input.propertyValue,
    rentValue: input.rentValue,
    agencyFee: input.agencyFee,
  }
}

function mapSummary(summary: ApiSummary): WalletSummary {
  const empty = { count: 0, value: 0 }
  return {
    totalInvested: summary.totalInvested,
    monthlyIncome: summary.monthlyIncome,
    totalAssets: summary.totalAssets,
    byType: {
      fii: summary.byType.FII ?? empty,
      acao: summary.byType.ACAO ?? empty,
      'renda-fixa': summary.byType.RENDA_FIXA ?? empty,
      cripto: summary.byType.CRIPTO ?? empty,
      aluguel: summary.byType.ALUGUEL ?? empty,
    },
  }
}

class InvestorWalletService {
  async list(): Promise<WalletAsset[]> {
    const assets = await api.get<ApiAsset[]>('/wallet/assets')
    return assets.map(mapAsset)
  }

  async create(input: WalletAssetInput): Promise<WalletAsset> {
    const asset = await api.post<ApiAsset>('/wallet/assets', toApiInput(input))
    return mapAsset(asset)
  }

  async update(id: string, input: Record<string, unknown>): Promise<WalletAsset> {
    const asset = await api.patch<ApiAsset>(`/wallet/assets/${id}`, input)
    return mapAsset(asset)
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/wallet/assets/${id}`)
  }

  async summarize(): Promise<WalletSummary> {
    const summary = await api.get<ApiSummary>('/wallet/summary')
    return mapSummary(summary)
  }

  async importB3(result: PortfolioImportResult): Promise<{ createdAssets: number; updatedAssets: number }> {
    return api.post('/wallet/import/b3', {
      fileName: result.fileName,
      importedAt: result.importedAt,
      positions: result.positions.map((position: PortfolioPosition) => ({
        ticker: position.ticker,
        product: position.product,
        cnpj: position.cnpj,
        institution: position.institution,
        shares: position.shares,
        price: position.price,
        value: position.value,
      })),
    })
  }
}

export const investorWalletService = new InvestorWalletService()
