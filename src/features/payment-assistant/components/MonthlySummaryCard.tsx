import { CheckCircle2, Clock, AlertTriangle, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency } from '@/shared/utils'
import type { MonthlySummary } from '../types'

interface MonthlySummaryCardProps {
  summary: MonthlySummary | null
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  if (!summary) return null

  const progress =
    summary.totalAmount > 0
      ? Math.round((summary.paidAmount / summary.totalAmount) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <SummaryTile
        icon={<Wallet className="size-4" />}
        label="Total do Mês"
        value={formatCurrency(summary.totalAmount, { currency: 'BRL' })}
        sub={`${summary.totalPayments} pagamentos`}
        tone="default"
      />
      <SummaryTile
        icon={<CheckCircle2 className="size-4" />}
        label="Pagos"
        value={formatCurrency(summary.paidAmount, { currency: 'BRL' })}
        sub={`${summary.paidCount} pagamentos • ${progress}%`}
        tone="success"
      />
      <SummaryTile
        icon={<Clock className="size-4" />}
        label="Pendentes"
        value={formatCurrency(summary.pendingAmount, { currency: 'BRL' })}
        sub={`${summary.pendingCount} pagamentos`}
        tone="warning"
      />
      <SummaryTile
        icon={<AlertTriangle className="size-4" />}
        label="Vencidos"
        value={formatCurrency(summary.overdueAmount, { currency: 'BRL' })}
        sub={`${summary.overdueCount} pagamentos`}
        tone="danger"
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
  tone: 'default' | 'success' | 'warning' | 'danger'
}) {
  const toneClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-amber-400',
    danger: 'text-destructive',
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className={toneClasses[tone]}>{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className={`font-mono text-base font-bold sm:text-lg ${toneClasses[tone]}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
