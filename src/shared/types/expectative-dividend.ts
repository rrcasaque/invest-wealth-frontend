export interface ExpectativeDividendAsset {
  name: string
  dividend: number
  cotesQuantity: number
}

export interface ExpectativeDividendMonth {
  source?: 'statusinvest'
  referenceMonth: number
  dividendTotal: number
  assets: ExpectativeDividendAsset[]
}
