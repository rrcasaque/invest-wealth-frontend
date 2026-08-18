import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseB3Spreadsheet, summarizeB3Import } from './b3-import.service'

const fixturePath = resolve(process.cwd(), 'movimentacao-2026-08-16-23-09-32.xlsx')
const fixtureAvailable = existsSync(fixturePath)
const fixtureBuffer = fixtureAvailable ? readFileSync(fixturePath) : null
const fixtureArrayBuffer = fixtureBuffer
  ? (fixtureBuffer.buffer.slice(
    fixtureBuffer.byteOffset,
    fixtureBuffer.byteOffset + fixtureBuffer.byteLength,
  ) as ArrayBuffer)
  : null

describe.skipIf(!fixtureAvailable)('parseB3Spreadsheet', () => {
  it('parseia o arquivo real da B3 e retorna movimentações', () => {
    const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

    expect(result.fileName).toBe('movimentacao.xlsx')
    expect(result.movimentacoes.length).toBeGreaterThan(100)
    expect(result.skippedRows).toBe(0) // header é ignorada pelo sheet_to_json
  })

  it('normaliza datas de dd/MM/yyyy para ISO', () => {
    const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

    const first = result.movimentacoes[0]
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('extrai o ticker do campo Produto', () => {
    const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

    const first = result.movimentacoes[0]
    expect(first.ticker).toBe('HGLG11')
    expect(first.product).toContain('HGLG11')
  })

  it('converte valores numéricos corretamente', () => {
    const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

    const first = result.movimentacoes[0]
    expect(first.quantity).toBe(24)
    expect(first.unitPrice).toBeCloseTo(1.17, 2)
    expect(first.operationValue).toBeCloseTo(28.08, 2)
  })

  it('lida com valores " - " (vazios) como zero', () => {
    const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

    // Linhas de "Cessão de Direitos" e "Direito de Subscrição" têm " - "
    const cessao = result.movimentacoes.find(
      (m) => m.movementType === 'Cessão de Direitos',
    )
    expect(cessao).toBeDefined()
    expect(cessao!.unitPrice).toBe(0)
  })
})

describe.skipIf(!fixtureAvailable)('summarizeB3Import', () => {
  const result = parseB3Spreadsheet(fixtureArrayBuffer!, 'movimentacao.xlsx')

  it('calcula totais de créditos e débitos', () => {
    const summary = summarizeB3Import(result)
    expect(summary.totalCreditos).toBeGreaterThan(0)
    expect(summary.totalDebitos).toBeGreaterThan(0)
    expect(summary.totalCreditos + summary.totalDebitos).toBe(summary.totalRows)
  })

  it('conta rendimentos', () => {
    const summary = summarizeB3Import(result)
    expect(summary.totalRendimentos).toBeGreaterThan(0)
  })

  it('conta tickers únicos', () => {
    const summary = summarizeB3Import(result)
    expect(summary.tickersUnicos).toBeGreaterThan(0)
  })

  it('calcula período a partir das datas', () => {
    const summary = summarizeB3Import(result)
    expect(summary.periodoInicio).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(summary.periodoFim).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
