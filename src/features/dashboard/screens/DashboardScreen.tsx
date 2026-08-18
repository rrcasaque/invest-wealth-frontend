import { AlertCircle, RefreshCw, Inbox, Wallet, TrendingUp, PiggyBank } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer, ResponsiveGrid } from '@/shared/layout'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency } from '@/shared/utils'
import { usePortfolioSummary } from '../hooks/usePortfolioSummary'
import {
  AllocationCard,
  DashboardHeader,
  DashboardSkeleton,
  PerformanceChartCard,
  PortfolioKpiCard,
  RecentTransactionsTable,
} from '../components'
import { getStoredPositions } from '@/shared/storage/portfolio-storage'
import { getStoredWalletAssets } from '@/shared/storage/wallet-storage'

export function DashboardScreen() {
  const { data, status, error, refetch } = usePortfolioSummary()
  const positions = getStoredPositions()
  const walletAssets = getStoredWalletAssets()
  const hasContent = positions.length > 0 || walletAssets.length > 0

  if (!hasContent) {
    return (
      <PageContainer
        maxWidth="wide"
        className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-semibold">Sua carteira está vazia</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Adicione ativos de renda fixa, criptomoedas, imóveis para aluguel ou importe
            sua carteira da B3 para visualizar seu painel consolidado.
          </p>
        </div>
        <Button asChild>
          <Link to="/carteira">
            <Wallet className="size-4" />
            Ir para a Carteira
          </Link>
        </Button>
      </PageContainer>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return <DashboardSkeleton />
  }

  if (status === 'error' || !data) {
    return (
      <PageContainer
        maxWidth="wide"
        className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      >
        <AlertCircle className="size-10 text-destructive" />
        <div>
          <h2 className="font-heading text-xl font-semibold">Não foi possível carregar o painel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? 'Ocorreu um erro inesperado.'}
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
      </PageContainer>
    )
  }

  const { summary, allocation, performance, transactions } = data
  const currency = summary.currency

  return (
    <PageContainer maxWidth="wide" className="space-y-4 sm:space-y-6">
      <DashboardHeader
        title="Visão Geral"
        description="Total investido, expectativa de rendimento mensal e distribuição por categoria."
      />

      <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3 }} gap="md">
        <PortfolioKpiCard
          label="Total Investido"
          value={summary.totalValue}
          currency={currency}
        />
        <PortfolioKpiCard
          label="Rendimento Mensal Esperado"
          value={summary.monthlyIncome}
          currency={currency}
        />
        <PortfolioKpiCard
          label="Contas a Pagar (Mês)"
          value={summary.monthlyReturn}
          currency={currency}
        />
      </ResponsiveGrid>

      <ResponsiveGrid cols={{ base: 1, lg: 3 }} gap="md">
        <PerformanceChartCard data={performance} />
        <AllocationCard allocation={allocation} currency={currency} />
      </ResponsiveGrid>

      {/* Distribuição por categoria — cards detalhados */}
      {allocation.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {allocation.map((slice) => (
            <CategoryTile
              key={slice.id}
              label={slice.label}
              value={slice.value}
              percentage={slice.percentage}
              color={slice.color}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Resumo de renda mensal por origem */}
      <MonthlyIncomeBreakdown
        summary={summary}
        allocation={allocation}
        currency={currency}
      />

      {transactions.length > 0 && (
        <RecentTransactionsTable transactions={transactions} currency={currency} />
      )}
    </PageContainer>
  )
}

function CategoryTile({
  label,
  value,
  percentage,
  color,
  currency,
}: {
  label: string
  value: number
  percentage: number
  color: string
  currency: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="font-mono text-base font-bold sm:text-lg">
          {formatCurrency(value, { currency })}
        </p>
        <p className="text-xs text-muted-foreground">{percentage}% do total</p>
      </CardContent>
    </Card>
  )
}

function MonthlyIncomeBreakdown({
  summary,
  allocation,
  currency,
}: {
  summary: { monthlyIncome: number; monthlyIncomeByCategory: Record<string, number> }
  allocation: { id: string; label: string; value: number; color: string }[]
  currency: string
}) {
  if (summary.monthlyIncome <= 0) return null

  // Categorias que geram renda, ordenadas pela mesma ordem do allocation.
  const incomeCategories = allocation.filter(
    (a) => (summary.monthlyIncomeByCategory[a.id] ?? 0) > 0,
  )

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-success" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Expectativa de Rendimento Mensal
            </p>
            <p className="font-mono text-2xl font-bold text-success">
              {formatCurrency(summary.monthlyIncome, { currency })}
            </p>
          </div>
        </div>
        {incomeCategories.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {incomeCategories.map((cat) => {
              const income = summary.monthlyIncomeByCategory[cat.id] ?? 0
              const yieldPct =
                cat.value > 0 ? (income / cat.value) * 100 : 0
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden
                    />
                    {cat.id === 'aluguel' && <PiggyBank className="size-3.5" />}
                    {cat.id === 'b3' && <TrendingUp className="size-3.5" />}
                    {cat.id === 'renda-fixa' && <TrendingUp className="size-3.5" />}
                    {cat.label}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {yieldPct.toFixed(2)}% a.m.
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(income, { currency })}
                    </span>
                  </span>
                </div>
              )
            })}            
          </div>
        )}
      </CardContent>
    </Card>
  )
}
