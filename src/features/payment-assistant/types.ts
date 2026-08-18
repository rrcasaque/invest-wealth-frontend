export type {
  PaymentStatus,
  PaymentCategory,
  PaymentRecurrence,
  PaymentPriority,
  PaymentReminder,
} from '@/shared/types/payment'

import type {
  PaymentCategory,
  PaymentPriority,
  PaymentRecurrence,
  PaymentReminder,
} from '@/shared/types/payment'

/** Dados do formulário para criar/editar um lembrete. */
export interface PaymentReminderInput {
  title: string
  notes?: string
  category: PaymentCategory
  amount: number
  dueDate: string
  priority: PaymentPriority
  recurrence: PaymentRecurrence
}

/** Resumo mensal de pagamentos. */
export interface MonthlySummary {
  /** Ano-mês no formato yyyy-MM. */
  month: string
  /** Rótulo legível (ex: "Agosto/2026"). */
  label: string
  totalPayments: number
  paidCount: number
  pendingCount: number
  overdueCount: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}

/** Filtros aplicáveis à listagem. */
export interface PaymentFilters {
  status: PaymentReminder['status'] | 'all'
  category: PaymentCategory | 'all'
  month: string | 'all'
  search: string
}
