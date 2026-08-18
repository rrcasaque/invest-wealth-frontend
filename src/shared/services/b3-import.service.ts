import * as XLSX from 'xlsx'
import type {
  B3ImportResult,
  B3ImportSummary,
  B3Movimentacao,
} from '../types/b3'

/**
 * Converte uma data dd/MM/yyyy para ISO yyyy-MM-dd.
 * Retorna null quando o formato é inválido.
 */
function parseB3Date(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Normaliza valores numéricos da planilha B3.
 * A B3 usa " - " (com espaços) para indicar valores vazios.
 * A exportação da B3 pode usar "." como separador decimal (formato EN)
 * ou "," como separador decimal (formato PT-BR).
 */
function parseB3Number(value: string): number {
  if (!value || value.trim() === '-' || value.trim() === '') return 0
  const trimmed = value.trim()
  // Se contém vírgula, assume formato PT-BR (1.234,56)
  if (trimmed.includes(',')) {
    const normalized = trimmed.replace(/\./g, '').replace(',', '.')
    const number = Number(normalized)
    return Number.isNaN(number) ? 0 : number
  }
  // Senão, assume formato EN (1.17) — não remove os pontos
  const number = Number(trimmed)
  return Number.isNaN(number) ? 0 : number
}

/**
 * Extrai o ticker do campo Produto.
 * O formato da B3 é "TICKER - Nome completo do ativo".
 */
function extractTicker(product: string): string {
  const match = /^([A-Z0-9]+)/.exec(product.trim())
  return match ? match[1] : product.split(' - ')[0]?.trim() ?? ''
}

interface RawRow {
  'Entrada/Saída': string
  Data: string
  Movimentação: string
  Produto: string
  Instituição: string
  Quantidade: string
  'Preço unitário': string
  'Valor da Operação': string
}

/**
 * Faz o parse de um ArrayBuffer de uma planilha B3 (formato .xlsx).
 *
 * @param buffer Conteúdo binário do arquivo .xlsx
 * @param fileName Nome do arquivo (usado para o resultado)
 * @returns Resultado consolidado da importação
 */
export function parseB3Spreadsheet(
  buffer: ArrayBuffer,
  fileName: string,
): B3ImportResult {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { movimentacoes: [], skippedRows: 0, fileName }
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { raw: false })

  const movimentacoes: B3Movimentacao[] = []
  let skippedRows = 0

  for (const row of rows) {
    // Validação mínima: precisa ter Entrada/Saída e Data
    const direction = row['Entrada/Saída']?.trim()
    const rawDate = row['Data']?.trim()
    if (!direction || !rawDate) {
      skippedRows += 1
      continue
    }

    const date = parseB3Date(rawDate)
    if (!date) {
      skippedRows += 1
      continue
    }

    const product = row['Produto']?.trim() ?? ''
    movimentacoes.push({
      direction: direction as B3Movimentacao['direction'],
      date,
      movementType: row['Movimentação']?.trim() ?? '',
      ticker: extractTicker(product),
      product,
      institution: row['Instituição']?.trim() ?? '',
      quantity: parseB3Number(row['Quantidade'] ?? ''),
      unitPrice: parseB3Number(row['Preço unitário'] ?? ''),
      operationValue: parseB3Number(row['Valor da Operação'] ?? ''),
    })
  }

  return { movimentacoes, skippedRows, fileName }
}

/**
 * Calcula estatísticas agregadas a partir das movimentações importadas.
 */
export function summarizeB3Import(
  result: B3ImportResult,
): B3ImportSummary {
  const { movimentacoes } = result
  const dates = movimentacoes.map((m) => m.date).sort()
  const tickers = new Set(movimentacoes.map((m) => m.ticker))

  return {
    totalRows: movimentacoes.length,
    totalCreditos: movimentacoes.filter((m) => m.direction === 'Credito').length,
    totalDebitos: movimentacoes.filter((m) => m.direction === 'Debito').length,
    totalRendimentos: movimentacoes.filter((m) => m.movementType === 'Rendimento').length,
    tickersUnicos: tickers.size,
    valorTotalOperacoes: movimentacoes.reduce((sum, m) => sum + m.operationValue, 0),
    periodoInicio: dates[0] ?? null,
    periodoFim: dates[dates.length - 1] ?? null,
  }
}

/**
 * Lê um File e faz o parse da planilha B3.
 */
export async function importB3File(file: File): Promise<B3ImportResult> {
  const buffer = await file.arrayBuffer()
  return parseB3Spreadsheet(buffer, file.name)
}
