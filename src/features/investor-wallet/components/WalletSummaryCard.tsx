import { Briefcase, TrendingUp, Coins, PiggyBank, FileSpreadsheet } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency } from '@/shared/utils'
import type { WalletSummary } from '../types'
import { walletTypeLabel } from './types-labels'

interface WalletSummaryCardProps {
  summary: WalletSummary | null
  /** Valor total das posições importadas da B3. */
  b3TotalValue?: number
}

export function WalletSummaryCard({ summary, b3TotalValue = 0 }: WalletSummaryCardProps) {
  if (!summary) return null

  const grandTotal = summary.totalInvested + b3TotalValue
  const totalAssets = summary.totalAssets + (b3TotalValue > 0 ? 1 : 0)

  return (
    <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <SummaryTile
        icon={<Briefcase className="size-4" />}
        label="Total Aplicado"
        value={formatCurrency(grandTotal, { currency: 'BRL' })}
        sub={`${totalAssets} carteira(s)/ativo(s)`}
        tone="default"
      />
      <SummaryTile
        icon={<TrendingUp className="size-4" />}
        label="Renda Mensal"
        value={formatCurrency(summary.monthlyIncome, { currency: 'BRL' })}
        sub="Aluguéis líquidos"
        tone="success"
      />
      <SummaryTile
        icon={<PiggyBank className="size-4" />}
        label={walletTypeLabel['renda-fixa']}
        value={formatCurrency(summary.byType['renda-fixa'].value, { currency: 'BRL' })}
        sub={`${summary.byType['renda-fixa'].count} ativo(s)`}
        tone="info"
      />
      <SummaryTile
        icon={<Coins className="size-4" />}
        label={walletTypeLabel.cripto}
        value={formatCurrency(summary.byType.cripto.value, { currency: 'BRL' })}
        sub={`${summary.byType.cripto.count} ativo(s)`}
        tone="warning"
      />
      <SummaryTile
        icon={<FileSpreadsheet className="size-4" />}
        label="Carteira B3"
        value={formatCurrency(b3TotalValue, { currency: 'BRL' })}
        sub={b3TotalValue > 0 ? 'Importada' : '—'}
        tone="info"
      />
    </div>
  )
}

function SummaryTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: 'default' | 'success' | 'info' | 'warning'
}) {
  const toneClasses = {
    default: 'text-foreground',
    success: 'text-success',
    info: 'text-blue-400',
    warning: 'text-amber-400',
  }

  return (
    <Card className="min-w-0">
      <CardContent className="flex min-w-0 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className={toneClasses[tone]}>{icon}</span>
          <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className={`min-w-0 break-words font-mono text-sm font-bold sm:text-base md:text-lg ${toneClasses[tone]}`}>
          {value}
        </p>
        <p className="min-w-0 truncate text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
