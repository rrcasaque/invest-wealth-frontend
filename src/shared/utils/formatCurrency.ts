export type CurrencyLocale = 'pt-BR' | 'en-US'

const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(locale: CurrencyLocale, currency: string): Intl.NumberFormat {
  const key = `${locale}:${currency}`
  let fmt = formatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    formatters.set(key, fmt)
  }
  return fmt
}

export interface FormatCurrencyOptions {
  locale?: CurrencyLocale
  currency?: string
  /** When true, returns the value with a leading + sign for positive numbers. */
  signed?: boolean
}

/**
 * Format a numeric value as currency.
 *
 * Defaults to BRL in pt-BR. Pass `currency: 'BRL'` for the institutional
 * dollar figures shown in the reference prototypes.
 */
export function formatCurrency(
  value: number,
  options: FormatCurrencyOptions = {},
): string {
  const { locale = 'pt-BR', currency = 'BRL', signed = false } = options
  const formatted = getFormatter(locale, currency).format(Math.abs(value))
  if (signed) {
    if (value > 0) return `+${formatted}`
    if (value < 0) return `-${formatted}`
  }
  return value < 0 ? `-${formatted}` : formatted
}
