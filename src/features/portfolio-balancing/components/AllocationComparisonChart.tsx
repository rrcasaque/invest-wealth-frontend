import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { AllocationTarget } from '../types'

interface AllocationComparisonChartProps {
  allocation: AllocationTarget[]
  deviation: number
}

export function AllocationComparisonChart({
  allocation,
  deviation,
}: AllocationComparisonChartProps) {
  // Build a conic-gradient string from the target percentages.
  let accumulated = 0
  const stops = allocation.map((slice) => {
    const start = accumulated
    accumulated += slice.targetPercentage
    return `${slice.color} ${start}% ${accumulated}%`
  })
  const conicGradient = `conic-gradient(from 0deg, ${stops.join(', ')})`

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Alocação Alvo vs Atual</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 p-5">
        <div
          className="relative flex size-48 items-center justify-center rounded-full"
          style={{ background: conicGradient }}
          role="img"
          aria-label="Distribuição alvo de alocação"
        >
          <div className="flex size-32 flex-col items-center justify-center rounded-full bg-surface-container-low shadow-inner">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Desvio</span>
            <span className="font-heading text-xl font-bold font-mono text-destructive">
              {deviation.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="mt-auto grid w-full grid-cols-1 gap-x-4 gap-y-2 pt-4 sm:grid-cols-2">
          {allocation.map((slice) => (
            <div key={slice.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              {slice.label} ({slice.targetPercentage}%)
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
