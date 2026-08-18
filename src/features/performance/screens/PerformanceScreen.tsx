import { AlertCircle, Inbox } from 'lucide-react'
import { useState } from 'react'
import { PageContainer, PageHeader, PageTitle, PageDescription, ResponsiveGrid } from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/ui/toast'
import { usePerformanceFilters, useBenchmarkVisibility } from '../hooks'
import {
  PerformanceFilters,
  PerformanceMetricCard,
  ComparativePerformanceChart,
  BenchmarkCard,
} from '../components'
import { getStoredPositions } from '@/shared/storage/portfolio-storage'
import { B3ImportDialog } from '@/app/components/B3ImportDialog'

export function PerformanceScreen() {
  const { data, status, error, period, assetClass, setPeriod, setAssetClass } =
    usePerformanceFilters()
  const { visible } = useBenchmarkVisibility()
  const { toast } = useToast()
  const [portfolioVersion, setPortfolioVersion] = useState(0)
  void portfolioVersion
  const positions = getStoredPositions()
  const hasPortfolio = positions.length > 0

  const handleExport = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'O arquivo CSV será gerado em instantes.',
    })
  }

  if (!hasPortfolio) {
    return (
      <PageContainer maxWidth="wide" className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-semibold">Nenhum ativo na carteira</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Importe o relatório consolidado mensal da B3 ou adicione uma operação
            manualmente para analisar o desempenho do seu portfólio.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <B3ImportDialog onImported={() => setPortfolioVersion((version) => version + 1)} />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="wide" className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Visão Geral de Desempenho</PageTitle>
          <PageDescription>
            Análise de portfólio institucional contra os principais benchmarks.
          </PageDescription>
        </div>
      </PageHeader>

      <PerformanceFilters
        period={period}
        assetClass={assetClass}
        onPeriodChange={setPeriod}
        onAssetClassChange={setAssetClass}
        onExport={handleExport}
      />

      {status === 'error' ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <div>
            <h2 className="font-heading text-xl font-semibold">Falha ao carregar desempenho</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : !data ? (
        <div className="space-y-6">
          <ResponsiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="md">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </ResponsiveGrid>
          <Skeleton className="h-[460px]" />
        </div>
      ) : (
        <>
          <ResponsiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="md">
            {data.metrics.map((metric) => (
              <PerformanceMetricCard key={metric.id} metric={metric} />
            ))}
          </ResponsiveGrid>

          <ResponsiveGrid cols={{ base: 1, lg: 12 }} gap="md">
            <ComparativePerformanceChart data={data.series} visible={visible} />
          </ResponsiveGrid>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold">Detalhamento de Benchmarks</h3>
            <ResponsiveGrid cols={{ base: 1, md: 3 }} gap="md">
              {data.benchmarks.map((benchmark) => (
                <BenchmarkCard key={benchmark.id} benchmark={benchmark} />
              ))}
            </ResponsiveGrid>
          </div>
        </>
      )}
    </PageContainer>
  )
}
