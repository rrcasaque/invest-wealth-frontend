import { Check, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { formatCurrency, cn } from '@/shared/utils'
import type { PortfolioRecommendation } from '../types'

interface RecommendationListProps {
  recommendations: PortfolioRecommendation[]
  remainingCapital?: number
  className?: string
}

export function RecommendationList({ recommendations, remainingCapital = 0, className }: RecommendationListProps) {
  return (
    <Card className={cn('flex h-full flex-col overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border bg-surface-container-low/50">
        <CardTitle className="text-lg">Distribuição Recomendada</CardTitle>
        <Badge variant="success">10% por ativo</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-2">
        <div className="flex-1 divide-y divide-border/50">
          {recommendations.map((rec) => (
            <RecommendationItem key={rec.id} recommendation={rec} />
          ))}
        </div>
        <div className="mt-auto space-y-2 border-t border-border bg-surface-container-low/80 p-3 text-sm">
          {remainingCapital > 0 && (
            <p className="text-muted-foreground">
              Saldo não investido por não ser suficiente para uma nova cota:{' '}
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(remainingCapital, { currency: 'BRL' })}
              </span>
            </p>
          )}
          <Button variant="outline" className="w-full">
            <Plus className="size-4" />
            Revisar Boletas de Ordem
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecommendationItemProps {
  recommendation: PortfolioRecommendation
}

function RecommendationItem({ recommendation: rec }: RecommendationItemProps) {
  const progressValue = Math.min(100, (rec.currentPercentage / rec.targetPercentage) * 100)
  const isBuying = rec.sharesToBuy > 0
  return (
    <div className="flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-surface-container-high/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          isBuying ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
        )}>
          {isBuying ? <Plus className="size-5" /> : <Check className="size-5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{rec.assetName}</p>
          <p className="font-mono text-xs text-muted-foreground">{rec.ticker} · {formatCurrency(rec.price, { currency: 'BRL' })}/cota</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className={cn('font-mono text-sm font-bold', isBuying ? 'text-success' : 'text-muted-foreground')}>
          {isBuying ? `+${rec.sharesToBuy} cotas` : 'Manter'}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {isBuying ? formatCurrency(rec.amount, { currency: 'BRL' }) : `${rec.projectedPercentage.toFixed(1)}% da carteira`}
        </p>
        <div className="mt-1 flex items-center gap-2 sm:justify-end">
          <div className="w-16">
            <Progress value={progressValue} indicatorClassName="bg-success" className="h-1.5" />
          </div>
          <span className="whitespace-nowrap text-xs uppercase tracking-wider text-muted-foreground">
            Alvo: {rec.targetPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
