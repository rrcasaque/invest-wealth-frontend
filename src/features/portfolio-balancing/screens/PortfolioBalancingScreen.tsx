import { AlertCircle, Inbox } from 'lucide-react'
import { useState } from 'react'
import { PageContainer, PageHeader, PageTitle, PageDescription, ResponsiveGrid } from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'
import { usePortfolioBalancing } from '../hooks/usePortfolioBalancing'
import {
  InvestmentCapitalForm,
  AllocationComparisonChart,
  RecommendationList,
} from '../components'
import { getStoredPositions, getStoredPortfolioMeta } from '@/shared/storage/portfolio-storage'
import { B3ImportDialog } from '@/app/components/B3ImportDialog'
import { formatCurrency, formatDate } from '@/shared/utils'

export function PortfolioBalancingScreen() {
  const { result, status, error, calculate } = usePortfolioBalancing()
  const [portfolioVersion, setPortfolioVersion] = useState(0)
  const positions = getStoredPositions()
  const meta = getStoredPortfolioMeta()
  const hasPortfolio = positions.length > 0
  void portfolioVersion

  return (
    <PageContainer maxWidth="wide" className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Balanceamento de Portfólio</PageTitle>
          <PageDescription>
            Otimize sua alocação de ativos com base em modelos alvo.
          </PageDescription>
        </div>
      </PageHeader>

      {hasPortfolio ? (
        <>
          {meta && (
            <p className="break-words text-xs text-muted-foreground">
              Carteira importada de <span className="break-all font-mono">{meta.fileName}</span> em{' '}
              {formatDate(meta.importedAt, 'short')} · {positions.length} ativos ·{' '}
              {formatCurrency(
                positions.reduce((sum, position) => sum + position.value, 0),
                { currency: 'BRL' },
              )}
            </p>
          )}

          <InvestmentCapitalForm
            onCalculate={(newCapital) => calculate({ newCapital })}
            isCalculating={status === 'loading'}
            currentValue={result?.currentValue}
            projectedValue={result?.projectedValue}
          />

          {status === 'error' ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-10 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : !result ? (
            <ResponsiveGrid cols={{ base: 1, lg: 12 }} gap="md">
              <Skeleton className="h-[400px] lg:col-span-5" />
              <Skeleton className="h-[400px] lg:col-span-7" />
            </ResponsiveGrid>
          ) : (
            <ResponsiveGrid cols={{ base: 1, lg: 12 }} gap="md">
              <div className="lg:col-span-5">
                <AllocationComparisonChart
                  allocation={result.allocation}
                  deviation={result.deviation}
                />
              </div>
              <div className="lg:col-span-7">
                <RecommendationList
                  recommendations={result.recommendations}
                  remainingCapital={result.remainingCapital}
                />
              </div>
            </ResponsiveGrid>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-surface-container-low/50 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhum ativo na carteira
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Importe o relatório consolidado mensal da B3 ou adicione uma operação
              manualmente para começar a balancear seu portfólio.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <B3ImportDialog onImported={() => setPortfolioVersion((version) => version + 1)} />
          </div>
        </div>
      )}
    </PageContainer>
  )
}
