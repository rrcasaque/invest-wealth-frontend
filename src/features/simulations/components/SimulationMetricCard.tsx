import type { ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency, formatPercentage, cn } from '@/shared/utils'

interface SimulationMetricCardProps {
  label: string
  value: number
  currency?: string
  hint?: ReactNode
  tone?: 'default' | 'success'
  className?: string
}

export function SimulationMetricCard({
  label,
  value,
  currency = 'BRL',
  hint,
  tone = 'default',
  className,
}: SimulationMetricCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-3xl font-bold tracking-tight font-mono">
          {formatCurrency(value, { currency })}
        </p>
        {hint && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-mono',
              tone === 'success' ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {tone === 'success' && <ArrowUp className="size-3.5" />}
            <span>{hint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface GrowthPercentageHintProps {
  percentage: number
}

export function GrowthPercentageHint({ percentage }: GrowthPercentageHintProps) {
  return <span>{formatPercentage(percentage, { signed: true })} de Crescimento</span>
}
