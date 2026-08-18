/** Status de um pagamento/lembrete. */
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

/** Categoria do pagamento para agrupamento visual. */
export type PaymentCategory =
  | 'conta'
  | 'imposto'
  | 'investimento'
  | 'cartao'
  | 'financiamento'
  | 'outros'

/** Frequência da recorrência do lembrete. */
export type PaymentRecurrence =
  | 'once'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

/** Prioridade do lembrete. */
export type PaymentPriority = 'low' | 'medium' | 'high'

/** Um lembrete de pagamento individual. */
export interface PaymentReminder {
  id: string
  /** Descrição/título do pagamento (ex: "Conta de Luz"). */
  title: string
  /** Detalhes adicionais opcionais. */
  notes?: string
  /** Categoria para agrupamento. */
  category: PaymentCategory
  /** Valor esperado do pagamento em BRL. */
  amount: number
  /** Data de vencimento no formato ISO yyyy-MM-dd. */
  dueDate: string
  /** Status atual do pagamento. */
  status: PaymentStatus
  /** Prioridade do lembrete. */
  priority: PaymentPriority
  /** Tipo de recorrência. */
  recurrence: PaymentRecurrence
  /** Data em que foi efetivamente pago (ISO) — null se não pago. */
  paidAt?: string | null
  /** Método de pagamento usado (ex: "Pix", "Boleto"). */
  paymentMethod?: string
  /** Comprovante/anexo — URL ou nome do arquivo. */
  receipt?: string
  /** Data de criação do lembrete (ISO). */
  createdAt: string
}
