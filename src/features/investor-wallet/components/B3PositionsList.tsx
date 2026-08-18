import { FileSpreadsheet, Trash2 } from 'lucide-react'
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
import { formatCurrency, formatDate } from '@/shared/utils'
import { clearPortfolio } from '@/shared/storage/portfolio-storage'
import type { PortfolioPosition } from '@/shared/types/portfolio'

interface B3PositionsListProps {
  positions: PortfolioPosition[]
  totalValue: number
  meta: { fileName: string; importedAt: string } | null
  onCleared: () => void
}

export function B3PositionsList({
  positions,
  totalValue,
  meta,
  onCleared,
}: B3PositionsListProps) {
  const handleClear = () => {
    clearPortfolio()
    onCleared()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <FileSpreadsheet className="size-4 text-primary" />
            Carteira B3 ({positions.length})
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {meta && (
              <Badge variant="outline" className="text-xs font-normal">
                {meta.fileName} • {formatDate(meta.importedAt, 'short')}
              </Badge>
            )}
            <span className="font-mono text-sm font-bold text-foreground">
              {formatCurrency(totalValue, { currency: 'BRL' })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={handleClear}
              title="Limpar carteira B3 importada"
            >
              <Trash2 className="size-3.5" />
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: card layout */}
        <div className="flex flex-col divide-y divide-border md:hidden">
          {positions.map((position) => (
            <div key={position.ticker} className="flex flex-col gap-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono font-semibold">{position.ticker}</span>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {position.product}
                  </p>
                  <p className="text-xs text-muted-foreground">{position.institution}</p>
                </div>
                <span className="shrink-0 font-mono font-semibold">
                  {formatCurrency(position.value, { currency: 'BRL' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{position.shares} cotas</span>
                <span className="font-mono">
                  {formatCurrency(position.price, { currency: 'BRL' })}/cota
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ticker</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead className="text-right">Cotas</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.ticker}>
                  <TableCell className="whitespace-nowrap font-mono font-semibold">
                    {position.ticker}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                    {position.product}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {position.institution}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono">
                    {position.shares}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono">
                    {formatCurrency(position.price, { currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono font-semibold">
                    {formatCurrency(position.value, { currency: 'BRL' })}
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
