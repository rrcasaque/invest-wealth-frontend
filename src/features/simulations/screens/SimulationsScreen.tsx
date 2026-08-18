import { AlertCircle } from 'lucide-react'
import { PageContainer, PageHeader, PageTitle, PageDescription, ResponsiveGrid } from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'
import { useSimulation } from '../hooks/useSimulation'
import {
  SimulationParametersForm,
  SimulationMetricCard,
  GrowthPercentageHint,
  GrowthProjectionChart,
} from '../components'

export function SimulationsScreen() {
  const { result, status, error, run } = useSimulation()

  return (
    <PageContainer maxWidth="wide" className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Motor de Simulação</PageTitle>
          <PageDescription>
            Projete retornos esperados para ações, dividendos e juros compostos ao longo do tempo.
          </PageDescription>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success sm:inline-flex">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          Motor Pronto
        </span>
      </PageHeader>

      <ResponsiveGrid cols={{ base: 1, xl: 12 }} gap="md">
        <div className="xl:col-span-4">
          <SimulationParametersForm onRun={run} isRunning={status === 'loading'} />
        </div>

        <div className="flex flex-col gap-6 xl:col-span-8">
          {status === 'error' ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-10 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : !result ? (
            <>
              <ResponsiveGrid cols={{ base: 1, md: 3 }} gap="md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </ResponsiveGrid>
              <Skeleton className="h-[420px]" />
            </>
          ) : (
            <>
              <ResponsiveGrid cols={{ base: 1, md: 3 }} gap="md">
                <SimulationMetricCard
                  label="Valor Projetado da Carteira"
                  value={result.projectedValue}
                  hint={<GrowthPercentageHint percentage={result.growthPercentage} />}
                  tone="success"
                />
                <SimulationMetricCard
                  label="Contribuições Totais"
                  value={result.totalContributions}
                  hint="Principal + Mensal"
                />
                <SimulationMetricCard
                  label="Ganhos Totais"
                  value={result.totalEarnings}
                  hint="Juros e Dividendos"
                  tone="success"
                />
              </ResponsiveGrid>
              <GrowthProjectionChart series={result.series} />
            </>
          )}
        </div>
      </ResponsiveGrid>
    </PageContainer>
  )
}
