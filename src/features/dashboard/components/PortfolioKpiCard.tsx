import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency, formatPercentage, cn } from '@/shared/utils'

interface PortfolioKpiCardProps {
  label: string
  value: number
  /** Optional delta shown below the value. Positive = green, negative = red. */
  delta?: { value: number; label: string; isPercentage?: boolean }
  currency?: string
  /** Render the value with the mono font (recommended for figures). */
  mono?: boolean
  className?: string
}

export function PortfolioKpiCard({
  label,
  value,
  delta,
  currency = 'BRL',
  mono = true,
  className,
}: PortfolioKpiCardProps) {
  const isPositive = (delta?.value ?? 0) >= 0
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={cn('font-heading text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl', mono && 'font-mono')}>
          {formatCurrency(value, { currency })}
        </p>
        {delta && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-sm font-mono',
              isPositive ? 'text-success' : 'text-destructive',
            )}
          >
            {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            <span>
              {delta.isPercentage
                ? formatPercentage(delta.value, { signed: true })
                : formatCurrency(delta.value, { currency, signed: true })}
            </span>
            <span className="text-muted-foreground">{delta.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
