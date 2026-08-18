import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/utils'
import type { PerformanceMetric } from '../types'

interface PerformanceMetricCardProps {
  metric: PerformanceMetric
  className?: string
}

export function PerformanceMetricCard({ metric, className }: PerformanceMetricCardProps) {
  const TrendIcon = metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : null
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {metric.label}
        </p>
        <p className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{metric.value}</p>
        {metric.hint && (
          <div
            className={cn(
              'mt-auto flex items-center gap-1.5 pt-2 text-xs font-mono',
              metric.trend === 'up' && 'text-success',
              metric.trend === 'down' && 'text-success',
              metric.trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {TrendIcon && <TrendIcon className="size-3.5" />}
            <span>{metric.hint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
