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
import { Button } from '@/shared/ui/button'
import { ChartTooltip } from '@/shared/charts'
import { formatCompact, formatMonthShort, cn } from '@/shared/utils'
import type { PerformancePoint } from '../types'

type Period = '1M' | 'Ano' | '1A'

const periods: Period[] = ['1M', 'Ano', '1A']

interface PerformanceChartCardProps {
  data: PerformancePoint[]
  className?: string
}

export function PerformanceChartCard({ data, className }: PerformanceChartCardProps) {
  const [period, setPeriod] = useState<Period>('Ano')

  const filtered = data.slice(period === '1M' ? -1 : period === 'Ano' ? 0 : 0)

  return (
    <Card className={cn('lg:col-span-2', className)}>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Desempenho dos Ativos</CardTitle>
        <div className="flex gap-1.5">
          {periods.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2.5 text-xs uppercase tracking-wider"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatMonthShort(value.split('/')[0])}
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
                  valueFormatter={(v) => formatCompact(v)}
                  labelFormatter={(label) => String(label)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Carteira"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#dashboardArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
