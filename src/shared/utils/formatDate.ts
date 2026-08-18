export type DateFormat = 'short' | 'medium' | 'long' | 'month-year'

const formatters = new Map<string, Intl.DateTimeFormat>()

function getFormatter(locale: string, format: DateFormat): Intl.DateTimeFormat {
  const key = `${locale}:${format}`
  let fmt = formatters.get(key)
  if (!fmt) {
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : format === 'medium'
          ? { day: '2-digit', month: 'short', year: 'numeric' }
          : format === 'long'
            ? { day: 'numeric', month: 'long', year: 'numeric' }
            : { month: 'short', year: 'numeric' }
    fmt = new Intl.DateTimeFormat(locale, options)
    formatters.set(key, fmt)
  }
  return fmt
}

export function formatDate(
  value: Date | string | number,
  format: DateFormat = 'medium',
  locale = 'pt-BR',
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return getFormatter(locale, format).format(date)
}

/**
 * Returns the short month label (jan, fev, …) used on chart axes.
 *
 * Accepts a Date, ISO string, timestamp, or a pre-formatted month
 * abbreviation (e.g. "Jan") which is returned lowercased as-is.
 */
export function formatMonthShort(value: Date | string | number, locale = 'pt-BR'): string {
  if (typeof value === 'string' && /^\p{L}{3}$/u.test(value)) {
    return value.toLowerCase()
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
}
