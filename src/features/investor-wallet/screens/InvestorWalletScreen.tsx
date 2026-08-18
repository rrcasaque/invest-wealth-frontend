import { AlertCircle, Briefcase, Inbox } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'
import { B3ImportDialog } from '@/app/components/B3ImportDialog'
import { useInvestorWallet } from '../hooks/useInvestorWallet'
import {
  B3PositionsList,
  WalletAssetForm,
  WalletAssetList,
  WalletSummaryCard,
} from '../components'

export function InvestorWalletScreen() {
  const {
    assets,
    summary,
    b3Positions,
    b3TotalValue,
    b3Meta,
    status,
    error,
    create,
    remove,
    refresh,
  } = useInvestorWallet()

  const hasAssets = assets.length > 0
  const hasB3 = b3Positions.length > 0
  const hasContent = hasAssets || hasB3

  return (
    <PageContainer maxWidth="wide" className="space-y-4 sm:space-y-6">
      <PageHeader>
        <div className="min-w-0 flex-1">
          <PageTitle className="flex items-center gap-2">
            <Briefcase className="size-5 shrink-0 text-primary sm:size-6" />
            <span className="truncate">Carteira de Investimentos</span>
          </PageTitle>
          <PageDescription>
            Gerencie todos os seus investimentos em um só lugar: ativos de renda fixa,
            criptomoedas, imóveis para aluguel e a carteira importada da B3.
          </PageDescription>
        </div>
        {hasContent && (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <B3ImportDialog onImported={refresh} />
            <WalletAssetForm onCreate={create} />
          </div>
        )}
      </PageHeader>

      {status === 'loading' && !hasContent ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : status === 'error' ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-12 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : !hasContent ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-surface-container-low/50 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Sua carteira está vazia
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Importe sua carteira da B3 ou adicione manualmente um ativo — renda fixa,
              criptomoeda ou imóvel para aluguel — para começar a acompanhar o total
              aplicado e a renda mensal.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <B3ImportDialog onImported={refresh} />
            <WalletAssetForm onCreate={create} />
          </div>
        </div>
      ) : (
        <>
          <WalletSummaryCard summary={summary} b3TotalValue={b3TotalValue} />

          {hasB3 && (
            <B3PositionsList
              positions={b3Positions}
              totalValue={b3TotalValue}
              meta={b3Meta}
              onCleared={refresh}
            />
          )}

          {hasAssets ? (
            <WalletAssetList assets={assets} onRemove={remove} />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-surface-container-low/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum ativo manual adicionado. Use{' '}
                <span className="font-medium text-foreground">Novo Ativo</span> para
                registrar renda fixa, criptomoedas ou imóveis.
              </p>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
