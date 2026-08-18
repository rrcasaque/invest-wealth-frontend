import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { formatCurrency, formatDate, cn } from '@/shared/utils'
import type { Transaction } from '../types'

interface RecentTransactionsTableProps {
  transactions: Transaction[]
  currency?: string
  className?: string
}

export function RecentTransactionsTable({
  transactions,
  currency = 'BRL',
  className,
}: RecentTransactionsTableProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border bg-surface-container-low/50">
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
        <Button variant="link" size="sm" className="hidden h-7 px-0 text-primary sm:inline-flex">
          Ver Tudo
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: card layout */}
        <div className="flex flex-col divide-y divide-border sm:hidden">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} currency={currency} />
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(tx.date, 'medium')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{tx.asset}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrency(tx.value, { currency })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Concluído' ? 'success' : 'warning'}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionCard({ tx, currency }: { tx: Transaction; currency: string }) {
  const isBuy = tx.type === 'Compra'
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          isBuy ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
        )}>
          {isBuy ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{tx.asset}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(tx.date, 'short')}
            </span>
            <Badge variant={tx.status === 'Concluído' ? 'success' : 'warning'} className="px-1.5 py-0 text-[10px]">
              {tx.status}
            </Badge>
          </div>
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
        {formatCurrency(tx.value, { currency })}
      </span>
    </div>
  )
}
