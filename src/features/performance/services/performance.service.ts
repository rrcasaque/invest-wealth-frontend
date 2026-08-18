import type { PerformanceData, PerformancePeriod } from '../types'

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function buildSeries(): PerformanceData['series'] {
  return months.map((month, index) => {
    const portfolio = 0 + index * 1.4 + Math.sin(index) * 0.8
    const cdi = index * 0.9
    const ibovespa = index * 0.7 + Math.sin(index / 2) * 1.2
    const ifix = index * 0.25 - Math.cos(index) * 0.4
    return {
      date: `${month}/2023`,
      portfolio: Number(portfolio.toFixed(2)),
      cdi: Number(cdi.toFixed(2)),
      ibovespa: Number(ibovespa.toFixed(2)),
      ifix: Number(ifix.toFixed(2)),
    }
  })
}

export const performanceService = {
  async getPerformanceData(_period: PerformancePeriod): Promise<PerformanceData> {
    await new Promise((resolve) => setTimeout(resolve, 350))
    return {
      metrics: [
        { id: 'total-return', label: 'Retorno Total (No Ano)', value: '14,82%', hint: '+420 bps vs CDI', trend: 'up' },
        { id: 'alpha', label: 'Alpha (vs IBOV)', value: '3,4%', hint: 'Anualizado', trend: 'neutral' },
        { id: 'volatility', label: 'Volatilidade da Carteira', value: '11,2%', hint: '-1,5% vs IBOV (12,7%)', trend: 'down' },
        { id: 'sharpe', label: 'Índice de Sharpe', value: '1,84', hint: 'Taxa livre de risco: CDI', trend: 'neutral' },
      ],
      series: buildSeries(),
      benchmarks: [
        { id: 'cdi', name: 'CDI', tag: 'Taxa Livre de Risco', value: '10,60%', period: 'No Ano', spread: '+4,22%' },
        { id: 'ibovespa', name: 'IBOVESPA', tag: 'Índice de Ações', value: '8,15%', period: 'No Ano', spread: '+6,67%' },
        { id: 'ifix', name: 'IFIX', tag: 'Índice Imobiliário', value: '2,40%', period: 'No Ano', spread: '+12,42%' },
      ],
    }
  },
}
