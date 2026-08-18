import type {
  PaymentCategory,
  PaymentPriority,
  PaymentRecurrence,
  PaymentStatus,
} from '../types'

export const paymentCategoryLabel: Record<PaymentCategory, string> = {
  conta: 'Conta',
  imposto: 'Imposto',
  investimento: 'Investimento',
  cartao: 'Cartão',
  financiamento: 'Financiamento',
  outros: 'Outros',
}

export const paymentCategoryColor: Record<PaymentCategory, string> = {
  conta: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  imposto: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  investimento: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cartao: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  financiamento: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  outros: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export const paymentPriorityLabel: Record<PaymentPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export const paymentPriorityColor: Record<PaymentPriority, string> = {
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

export const paymentRecurrenceLabel: Record<PaymentRecurrence, string> = {
  once: 'Único',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
}

export const paymentStatusColor: Record<PaymentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  overdue: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}
