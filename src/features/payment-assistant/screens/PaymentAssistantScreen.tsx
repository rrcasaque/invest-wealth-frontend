import { useMemo, useState } from 'react'
import { AlertCircle, Wallet, CalendarDays, Inbox } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'
import { usePaymentAssistant } from '../hooks/usePaymentAssistant'
import {
  PaymentReminderForm,
  PaymentFiltersBar,
  MonthlySummaryCard,
  PaymentList,
} from '../components'
import type { PaymentFilters, PaymentReminder } from '../types'

function buildMonthOptions(reminders: PaymentReminder[]): { value: string; label: string }[] {
  const months = new Set<string>()
  reminders.forEach((r) => months.add(r.dueDate.slice(0, 7)))
  // Garantir o mês corrente
  months.add(new Date().toISOString().slice(0, 7))

  return [...months]
    .sort()
    .reverse()
    .slice(0, 12)
    .map((value) => {
      const [year, mon] = value.split('-')
      const date = new Date(Number(year), Number(mon) - 1, 1)
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) }
    })
}

export function PaymentAssistantScreen() {
  const {
    reminders,
    summary,
    status,
    error,
    selectedMonth,
    setSelectedMonth,
    create,
    markAsPaid,
    markAsPending,
    remove,
  } = usePaymentAssistant()

  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    category: 'all',
    month: 'all',
    search: '',
  })

  const monthOptions = useMemo(() => buildMonthOptions(reminders), [reminders])

  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      if (filters.status !== 'all' && r.status !== filters.status) return false
      if (filters.category !== 'all' && r.category !== filters.category) return false
      if (filters.month !== 'all' && !r.dueDate.startsWith(filters.month)) return false
      if (
        filters.search &&
        !r.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(r.notes?.toLowerCase().includes(filters.search.toLowerCase()) ?? false)
      )
        return false
      return true
    })
  }, [reminders, filters])

  const hasReminders = reminders.length > 0

  return (
    <PageContainer maxWidth="wide" className="space-y-4 sm:space-y-6">
      <PageHeader>
        <div className="min-w-0">
          <PageTitle className="flex items-center gap-2">
            <Wallet className="size-5 shrink-0 text-primary sm:size-6" />
            <span className="truncate">Assistente de Pagamentos</span>
          </PageTitle>
          <PageDescription>
            Gerencie lembretes de pagamentos, acompanhe vencimentos e controle o que já foi pago
            a cada mês.
          </PageDescription>
        </div>
        {hasReminders && (
          <div className="w-full sm:w-auto">
            <PaymentReminderForm onCreate={create} />
          </div>
        )}
      </PageHeader>

      {status === 'loading' && reminders.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
      ) : !hasReminders ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-surface-container-low/50 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhum lembrete de pagamento
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Crie seu primeiro lembrete para acompanhar vencimentos, controlar pagamentos
              e visualizar o resumo mensal da sua rotina financeira.
            </p>
          </div>
          <PaymentReminderForm onCreate={create} />
        </div>
      ) : (
        <>
          {/* Resumo do mês selecionado */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {summary?.label ?? 'Mês'}
                </h2>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full max-w-[200px] rounded-md border border-border bg-surface-container-high px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Selecionar mês do resumo"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <MonthlySummaryCard summary={summary} />
          </div>

          {/* Listagem principal em largura total */}
          <div className="flex flex-col gap-4">
            <PaymentFiltersBar
              filters={filters}
              onChange={setFilters}
              months={monthOptions}
            />
            <PaymentList
              reminders={filteredReminders}
              onMarkAsPaid={markAsPaid}
              onMarkAsPending={markAsPending}
              onRemove={remove}
            />
          </div>
        </>
      )}
    </PageContainer>
  )
}
