/** Ativo da carteira importado da planilha consolidada mensal da B3. */
export interface PortfolioPosition {
  /** Ticker do ativo (ex: "BTLG11"). */
  ticker: string
  /** Nome completo do produto. */
  product: string
  /** CNPJ do fundo. */
  cnpj: string
  /** Instituição intermediadora. */
  institution: string
  /** Quantidade de cotas. */
  shares: number
  /** Preço de fechamento na data do relatório. */
  price: number
  /** Valor atualizado (quantidade * preço). */
  value: number
}

/** Resultado do parse da aba "Posição - Fundos". */
export interface PortfolioImportResult {
  positions: PortfolioPosition[]
  totalValue: number
  fileName: string
  importedAt: string
}
