import * as XLSX from 'xlsx'
import type { PortfolioImportResult, PortfolioPosition } from '../types/portfolio'

/**
 * Normaliza valores numéricos da planilha B3.
 * A B3 usa " - " (com espaços) para indicar valores vazios.
 */
function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0
  const trimmed = String(value).trim()
  if (trimmed === '' || trimmed === '-') return 0
  // Se contém vírgula, assume formato PT-BR (1.234,56)
  if (trimmed.includes(',')) {
    const normalized = trimmed.replace(/\./g, '').replace(',', '.')
    const number = Number(normalized)
    return Number.isNaN(number) ? 0 : number
  }
  const number = Number(trimmed)
  return Number.isNaN(number) ? 0 : number
}

interface RawPositionRow {
  Produto?: string
  Instituição?: string
  Conta?: string
  'Código de Negociação'?: string
  'CNPJ do Fundo'?: string
  'Código ISIN / Distribuição'?: string
  Tipo?: string
  Administrador?: string
  Quantidade?: string
  'Quantidade Disponível'?: string
  'Quantidade Indisponível'?: string
  Motivo?: string
  'Preço de Fechamento'?: string
  'Valor Atualizado'?: string
}

/**
 * Faz o parse de um ArrayBuffer da planilha consolidada mensal da B3.
 * Lê a aba "Posição - Fundos" e extrai as posições da carteira.
 *
 * @param buffer Conteúdo binário do arquivo .xlsx
 * @param fileName Nome do arquivo (usado para o resultado)
 * @returns Posições da carteira e valor total
 */
export function parsePortfolioSpreadsheet(
  buffer: ArrayBuffer,
  fileName: string,
): PortfolioImportResult {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheetName = workbook.SheetNames.find((name) =>
    name.toLowerCase().includes('posição'),
  ) ?? workbook.SheetNames[0]

  if (!sheetName) {
    return { positions: [], totalValue: 0, fileName, importedAt: new Date().toISOString() }
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<RawPositionRow>(sheet, { raw: false })

  const positions: PortfolioPosition[] = []
  for (const row of rows) {
    const ticker = row['Código de Negociação']?.trim() ?? ''
    // Ignora linhas vazias e a linha de "Total"
    if (!ticker) continue

    const shares = parseNumber(row['Quantidade'])
    if (shares === 0) continue

    const price = parseNumber(row['Preço de Fechamento'])
    const value = parseNumber(row['Valor Atualizado'])

    positions.push({
      ticker,
      product: row['Produto']?.trim() ?? '',
      cnpj: row['CNPJ do Fundo']?.trim() ?? '',
      institution: row['Instituição']?.trim() ?? '',
      shares,
      price,
      value,
    })
  }

  const totalValue = positions.reduce((sum, position) => sum + position.value, 0)

  return {
    positions,
    totalValue,
    fileName,
    importedAt: new Date().toISOString(),
  }
}

/**
 * Lê um File e faz o parse da planilha consolidada mensal da B3.
 */
export async function importPortfolioFile(file: File): Promise<PortfolioImportResult> {
  const buffer = await file.arrayBuffer()
  return parsePortfolioSpreadsheet(buffer, file.name)
}
