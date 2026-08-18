import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { investorWalletService } from './investor-wallet.service'
import { clearWalletAssets } from '@/shared/storage/wallet-storage'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  clearWalletAssets()
})

describe('investorWalletService', () => {
  it('cria e lista ativos de renda fixa, cripto e aluguel', async () => {
    await investorWalletService.create({
      type: 'renda-fixa',
      name: 'Tesouro Selic',
      institution: 'Banco X',
      amount: 1000,
      rate: 10,
    })
    await investorWalletService.create({
      type: 'cripto',
      name: 'Bitcoin',
      symbol: 'BTC',
      quantity: 0.5,
      purchasePrice: 200000,
    })
    await investorWalletService.create({
      type: 'aluguel',
      name: 'Apto Centro',
      propertyValue: 300000,
      rentValue: 1500,
      agencyFee: 150,
    })

    const list = await investorWalletService.list()
    expect(list).toHaveLength(3)
    expect(list.some((a) => a.type === 'renda-fixa' && a.institution === 'Banco X')).toBe(true)
    expect(list.some((a) => a.type === 'cripto' && a.symbol === 'BTC')).toBe(true)
    expect(list.some((a) => a.type === 'aluguel' && a.propertyValue === 300000)).toBe(true)
  })

  it('sumariza total aplicado e renda mensal líquida de aluguéis', async () => {
    await investorWalletService.create({
      type: 'renda-fixa',
      name: 'CDB',
      institution: 'Banco Y',
      amount: 5000,
      rate: 12,
    })
    await investorWalletService.create({
      type: 'cripto',
      name: 'ETH',
      symbol: 'ETH',
      quantity: 2,
      purchasePrice: 10000,
    })
    await investorWalletService.create({
      type: 'aluguel',
      name: 'Casa',
      propertyValue: 400000,
      rentValue: 2000,
      agencyFee: 10,
    })

    const summary = await investorWalletService.summarize()
    // 5000 + (2 * 10000) + 400000 = 425000
    expect(summary.totalInvested).toBe(425000)
    // 2000 * (1 - 10/100) = 1800
    expect(summary.monthlyIncome).toBe(1800)
    expect(summary.totalAssets).toBe(3)
    expect(summary.byType['renda-fixa'].value).toBe(5000)
    expect(summary.byType.cripto.value).toBe(20000)
    expect(summary.byType.aluguel.value).toBe(400000)
  })

  it('remove um ativo pelo id', async () => {
    const created = await investorWalletService.create({
      type: 'renda-fixa',
      name: 'LCI',
      institution: 'Banco Z',
      amount: 2000,
      rate: 9,
    })
    await investorWalletService.remove(created.id)
    const list = await investorWalletService.list()
    expect(list).toHaveLength(0)
  })
})
