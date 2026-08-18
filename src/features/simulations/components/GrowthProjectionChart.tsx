import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ChartTooltip } from '@/shared/charts'
import { formatCompact, cn } from '@/shared/utils'
import type { SimulationHorizon, SimulationSeriesPoint } from '../types'

interface GrowthProjectionChartProps {
  series: SimulationSeriesPoint[]
  className?: string
}

const horizons: SimulationHorizon[] = ['10A', '20A', '30A']

export function GrowthProjectionChart({ series, className }: GrowthProjectionChartProps) {
  const [horizon, setHorizon] = useState<SimulationHorizon>('20A')
  const horizonYears = Number(horizon.replace('A', ''))
  const filtered = series.filter((point) => point.year <= horizonYears)

  return (
    <Card className={cn('flex flex-1 flex-col', className)}>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Projeção de Crescimento</CardTitle>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-container-high p-1">
          {horizons.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={
                'whitespace-nowrap rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ' +
                (horizon === h
                  ? 'bg-surface-container-highest text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground')
              }
              aria-pressed={horizon === h}
            >
              {h}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-[260px] w-full sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="totalArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="contribArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--outline))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--outline))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="year"
              tickFormatter={(value: number) => `A${value}`}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCompact(value)}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => `Ano ${label}`}
                  valueFormatter={(v) => formatCompact(v)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="contributions"
              name="Contribuições Totais"
              stroke="hsl(var(--outline))"
              strokeDasharray="4 4"
              strokeWidth={2}
              fill="url(#contribArea)"
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Valor Total"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#totalArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:gap-6">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-primary" />
            Valor Total
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded border border-dashed border-outline" />
            Contribuições Totais
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
