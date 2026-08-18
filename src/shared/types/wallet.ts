/** Categoria de ativo da carteira de investidor. */
export type WalletAssetType = 'renda-fixa' | 'cripto' | 'aluguel'

/** Campos comuns a todos os ativos da carteira. */
export interface WalletAssetBase {
  id: string
  /** Tipo do ativo (discriminador da união). */
  type: WalletAssetType
  /** Nome/identificação do ativo. */
  name: string
  /** Detalhes adicionais opcionais. */
  notes?: string
  /** Data de criação do registro (ISO yyyy-MM-dd). */
  createdAt: string
}

/** Ativo de renda fixa (CDB, Tesouro, LCI/LCA, etc.). */
export interface FixedIncomeAsset extends WalletAssetBase {
  type: 'renda-fixa'
  /** Instituição emissora. */
  institution: string
  /** Valor aplicado em BRL. */
  amount: number
  /** Taxa de remuneração (% a.a.). */
  rate: number
  /** Data de vencimento (ISO yyyy-MM-dd), quando aplicável. */
  maturity?: string
}

/** Ativo de criptomoeda. */
export interface CryptoAsset extends WalletAssetBase {
  type: 'cripto'
  /** Símbolo/ticker (ex: "BTC", "ETH"). */
  symbol: string
  /** Quantidade de unidades. */
  quantity: number
  /** Preço de compra unitário em BRL. */
  purchasePrice: number
}

/** Ativo de imóvel para aluguel. */
export interface RentalAsset extends WalletAssetBase {
  type: 'aluguel'
  /** Valor total do imóvel em BRL. */
  propertyValue: number
  /** Valor do aluguel mensal em BRL. */
  rentValue: number
  /** Taxa mensal da imobiliária em percentual do aluguel (%). */
  agencyFee: number
}

/** Ativo da carteira de investidor (união discriminada). */
export type WalletAsset = FixedIncomeAsset | CryptoAsset | RentalAsset
