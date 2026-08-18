import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { PaymentFilters } from '../types'

interface PaymentFiltersBarProps {
  filters: PaymentFilters
  onChange: (filters: PaymentFilters) => void
  months: { value: string; label: string }[]
}

export function PaymentFiltersBar({ filters, onChange, months }: PaymentFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v as PaymentFilters['status'] })}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ ...filters, category: v as PaymentFilters['category'] })}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="conta">Conta</SelectItem>
            <SelectItem value="imposto">Imposto</SelectItem>
            <SelectItem value="investimento">Investimento</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="financiamento">Financiamento</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.month}
          onValueChange={(v) => onChange({ ...filters, month: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
