import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ChartTooltip } from '@/shared/charts'
import { formatMonthShort, cn } from '@/shared/utils'
import type { BenchmarkKey, PerformancePoint } from '../types'

interface ComparativePerformanceChartProps {
  data: PerformancePoint[]
  visible: Record<BenchmarkKey, boolean>
  className?: string
}

const seriesConfig: { key: BenchmarkKey; name: string; color: string }[] = [
  { key: 'portfolio', name: 'Minha Carteira', color: 'hsl(var(--chart-portfolio))' },
  { key: 'cdi', name: 'CDI', color: 'hsl(var(--chart-cdi))' },
  { key: 'ibovespa', name: 'IBOVESPA', color: 'hsl(var(--chart-ibov))' },
  { key: 'ifix', name: 'IFIX', color: 'hsl(var(--chart-ifix))' },
]

export function ComparativePerformanceChart({
  data,
  visible,
  className,
}: ComparativePerformanceChartProps) {
  const [activeKey, setActiveKey] = useState<BenchmarkKey | null>(null)

  return (
    <Card className={cn('col-span-12', className)}>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg">Desempenho Comparativo</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {seriesConfig.map((series) => (
            <button
              key={series.key}
              type="button"
              onClick={() => setActiveKey((current) => (current === series.key ? null : series.key))}
              className={
                'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-surface-container-high ' +
                (visible[series.key] ? 'opacity-100' : 'opacity-40')
              }
              aria-pressed={activeKey === series.key}
            >
              <span
                className="size-3 rounded-full"
                style={{
                  backgroundColor: series.color,
                  boxShadow: activeKey === series.key ? `0 0 8px ${series.color}` : undefined,
                }}
              />
              <span className="text-foreground">{series.name}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatMonthShort(value.split('/')[0])}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => `${value > 0 ? '+' : ''}${value}%`}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={
                <ChartTooltip
                  valueFormatter={(v) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR')}%`}
                />
              }
            />
            {seriesConfig.map((series) =>
              visible[series.key] ? (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={series.key === 'portfolio' ? 3 : 1.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
