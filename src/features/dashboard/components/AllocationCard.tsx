import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { formatCurrency } from '@/shared/utils'
import type { AllocationSlice } from '../types'

interface AllocationCardProps {
  allocation: AllocationSlice[]
  currency?: string
  className?: string
}

export function AllocationCard({ allocation, currency = 'BRL', className }: AllocationCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Alocação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
        {allocation.map((slice) => (
          <div key={slice.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                {slice.label}
              </span>
              <span className="font-mono text-foreground">{slice.percentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${slice.percentage}%`, backgroundColor: slice.color }}
              />
            </div>
            <p className="mt-1 text-right font-mono text-xs text-muted-foreground">
              {formatCurrency(slice.value, { currency })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
