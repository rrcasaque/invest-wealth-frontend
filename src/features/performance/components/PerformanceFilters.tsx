import { Download, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { AssetClass, PerformancePeriod } from '../types'

interface PerformanceFiltersProps {
  period: PerformancePeriod
  assetClass: AssetClass
  onPeriodChange: (period: PerformancePeriod) => void
  onAssetClassChange: (assetClass: AssetClass) => void
  onExport: () => void
}

const periods: { value: PerformancePeriod; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '6M', label: '6M' },
  { value: 'YTD', label: 'No Ano' },
  { value: '1A', label: '1A' },
  { value: '3A', label: '3A' },
  { value: 'MAX', label: 'MAX' },
]

const assetClasses: { value: AssetClass; label: string }[] = [
  { value: 'all', label: 'Todas as Classes' },
  { value: 'stocks', label: 'Ações' },
  { value: 'fixed-income', label: 'Renda Fixa' },
  { value: 'crypto', label: 'Cripto' },
]

export function PerformanceFilters({
  period,
  assetClass,
  onPeriodChange,
  onAssetClassChange,
  onExport,
}: PerformanceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={assetClass} onValueChange={(v) => onAssetClassChange(v as AssetClass)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Wallet className="mr-2 size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assetClasses.map((ac) => (
              <SelectItem key={ac.value} value={ac.value}>
                {ac.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onExport} className="w-full sm:w-auto">
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      <div className="inline-flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface-container-low p-1">
        {periods.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPeriodChange(p.value)}
            className={
              'whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ' +
              (period === p.value
                ? 'bg-surface-container-highest text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground')
            }
            aria-pressed={period === p.value}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
