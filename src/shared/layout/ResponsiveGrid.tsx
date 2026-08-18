import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    base?: 1 | 2 | 3 | 4
    sm?: 1 | 2 | 3 | 4
    md?: 1 | 2 | 3 | 4 | 6
    lg?: 1 | 2 | 3 | 4 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 6 | 12
  }
  gap?: 'sm' | 'md' | 'lg'
}

const colMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
}

const smColMap: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

const mdColMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
}

const lgColMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
}

const xlColMap: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  6: 'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
}

const gapMap = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
} as const

export const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols, gap = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid',
        cols?.base && colMap[cols.base],
        cols?.sm && smColMap[cols.sm],
        cols?.md && mdColMap[cols.md],
        cols?.lg && lgColMap[cols.lg],
        cols?.xl && xlColMap[cols.xl],
        gapMap[gap],
        className,
      )}
      {...props}
    />
  ),
)
ResponsiveGrid.displayName = 'ResponsiveGrid'
