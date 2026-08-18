import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height in pixels or any CSS height value. */
  height?: number | string
}

/**
 * Generic wrapper that gives charts a consistent responsive height,
 * border and inner padding. Use with Recharts' <ResponsiveContainer>.
 */
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, height = 280, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative w-full', className)}
      style={{ height, ...style }}
      {...props}
    />
  ),
)
ChartContainer.displayName = 'ChartContainer'

export interface ChartTooltipPayloadItem {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string | number
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string | number
  /** Optional formatter applied to each value. */
  valueFormatter?: (value: number, name: string) => string
  labelFormatter?: (label: string | number) => string
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-lg border border-border px-3 py-2 text-xs shadow-xl">
      {label !== undefined && (
        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => {
          const name = String(item.name ?? '')
          const value =
            typeof item.value === 'number'
              ? valueFormatter
                ? valueFormatter(item.value, name)
                : item.value.toLocaleString('pt-BR')
              : String(item.value ?? '')
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-foreground">
                {item.color && (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {name}
              </span>
              <span className="font-mono font-semibold text-foreground">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
