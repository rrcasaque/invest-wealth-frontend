import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parsePortfolioSpreadsheet } from './portfolio-import.service'

const fixturePath = resolve(process.cwd(), 'relatorio-consolidado-mensal-2026-julho.xlsx')
const fixtureBuffer = readFileSync(fixturePath)
const fixtureArrayBuffer = fixtureBuffer.buffer.slice(
  fixtureBuffer.byteOffset,
  fixtureBuffer.byteOffset + fixtureBuffer.byteLength,
) as ArrayBuffer

describe('parsePortfolioSpreadsheet', () => {
  it('parseia o relatório consolidado mensal e retorna posições', () => {
    const result = parsePortfolioSpreadsheet(fixtureArrayBuffer, 'relatorio.xlsx')

    expect(result.fileName).toBe('relatorio.xlsx')
    expect(result.positions.length).toBe(11)
  })

  it('extrai ticker, quantidade, preço e valor corretamente', () => {
    const result = parsePortfolioSpreadsheet(fixtureArrayBuffer, 'relatorio.xlsx')

    const btlg = result.positions.find((position) => position.ticker === 'BTLG11')
    expect(btlg).toBeDefined()
    expect(btlg!.shares).toBe(36)
    expect(btlg!.price).toBeCloseTo(100.81, 2)
    expect(btlg!.value).toBeCloseTo(3629.16, 2)
  })

  it('ignora a linha de Total', () => {
    const result = parsePortfolioSpreadsheet(fixtureArrayBuffer, 'relatorio.xlsx')

    expect(result.positions.every((position) => position.ticker !== '')).toBe(true)
  })

  it('calcula o valor total da carteira', () => {
    const result = parsePortfolioSpreadsheet(fixtureArrayBuffer, 'relatorio.xlsx')

    expect(result.totalValue).toBeCloseTo(34446.97, 2)
  })
})
