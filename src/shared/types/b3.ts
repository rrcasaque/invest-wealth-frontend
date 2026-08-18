/** Tipo de movimentação (entrada/saída) conforme exportado pela B3. */
export type B3Direction = 'Credito' | 'Debito'

/** Categoria da movimentação conforme coluna "Movimentação" da B3. */
export type B3MovementType =
  | 'Rendimento'
  | 'Cessão de Direitos'
  | 'Cessão de Direitos - Solicitada'
  | 'Direito de Subscrição'
  | 'Direitos de Subscrição - Não Exercido'
  | 'Transferência - Liquidação'
  | string

/** Linha individual de movimentação parseada a partir da planilha B3. */
export interface B3Movimentacao {
  /** "Credito" ou "Debito". */
  direction: B3Direction
  /** Data no formato ISO yyyy-MM-dd (normalizada a partir de dd/MM/yyyy). */
  date: string
  /** Categoria da movimentação. */
  movementType: B3MovementType
  /** Ticker extraído do início do campo Produto (ex: "HGLG11"). */
  ticker: string
  /** Nome completo do produto. */
  product: string
  /** Instituição intermediadora. */
  institution: string
  /** Quantidade de ativos (0 quando não aplicável). */
  quantity: number
  /** Preço unitário (0 quando não aplicável). */
  unitPrice: number
  /** Valor total da operação (0 quando não aplicável). */
  operationValue: number
}

/** Resultado consolidado da importação. */
export interface B3ImportResult {
  /** Linhas parseadas com sucesso. */
  movimentacoes: B3Movimentacao[]
  /** Número de linhas ignoradas (header, vazias, inválidas). */
  skippedRows: number
  /** Nome do arquivo importado. */
  fileName: string
}

/** Estatísticas agregadas da importação. */
export interface B3ImportSummary {
  totalRows: number
  totalCreditos: number
  totalDebitos: number
  totalRendimentos: number
  tickersUnicos: number
  valorTotalOperacoes: number
  periodoInicio: string | null
  periodoFim: string | null
}
