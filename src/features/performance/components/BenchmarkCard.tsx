import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/utils'
import type { BenchmarkDetail } from '../types'

interface BenchmarkCardProps {
  benchmark: BenchmarkDetail
  className?: string
}

export function BenchmarkCard({ benchmark, className }: BenchmarkCardProps) {
  return (
    <Card className={cn('group flex flex-col transition-colors hover:border-primary/40', className)}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold">{benchmark.name}</h4>
            <Badge variant="muted" className="mt-1">
              {benchmark.tag}
            </Badge>
          </div>
          <ArrowRight className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-bold sm:text-2xl">{benchmark.value}</span>
          <span className="font-mono text-xs text-muted-foreground">{benchmark.period}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Spread da Carteira</span>
          <span className="rounded bg-success/10 px-2 py-0.5 font-mono text-xs text-success">
            {benchmark.spread}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
