export interface FormatPercentageOptions {
  /** Number of fraction digits. Defaults to 2. */
  fractionDigits?: number
  /** When true, prepends a + sign for positive values. */
  signed?: boolean
}

/**
 * Format a numeric ratio/percentage value.
 *
 * Accepts the value already in percentage points (e.g. `14.82` => "14,82%")
 * or a ratio when `fromRatio` is true (e.g. `0.1482` => "14,82%").
 */
export function formatPercentage(
  value: number,
  options: FormatPercentageOptions & { fromRatio?: boolean } = {},
): string {
  const { fractionDigits = 2, signed = false, fromRatio = false } = options
  const points = fromRatio ? value * 100 : value
  const abs = Math.abs(points)
  const text = abs.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  const sign = points > 0 && signed ? '+' : points < 0 ? '-' : ''
  return `${sign}${text}%`
}
