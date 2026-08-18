export interface FormatNumberOptions {
  fractionDigits?: number
  locale?: 'pt-BR' | 'en-US'
}

export function formatNumber(
  value: number,
  options: FormatNumberOptions = {},
): string {
  const { fractionDigits = 0, locale = 'pt-BR' } = options
  return value.toLocaleString(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * Compact a large number into a short representation (e.g. 1.2M, 3.4B).
 */
export function formatCompact(value: number, locale: 'pt-BR' | 'en-US' = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
