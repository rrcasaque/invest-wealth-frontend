import { api } from '@/shared/api/client'
import type { MonthlySummary, PaymentReminder, PaymentReminderInput } from '../types'

interface ApiPayment {
  id: number
  title: string
  notes: string | null
  category: string
  amount: number | string
  dueDate: string
  status: string
  priority: string
  recurrence: string
  paidAt: string | null
  paymentMethod: string | null
  receipt: string | null
  createdAt: string
}

const toApi = (value: string) => value.toUpperCase()
const fromApi = (value: string) => value.toLowerCase()

function mapPayment(item: ApiPayment): PaymentReminder {
  return {
    id: String(item.id),
    title: item.title,
    notes: item.notes ?? undefined,
    category: fromApi(item.category) as PaymentReminder['category'],
    amount: Number(item.amount),
    dueDate: item.dueDate.slice(0, 10),
    status: fromApi(item.status) as PaymentReminder['status'],
    priority: fromApi(item.priority) as PaymentReminder['priority'],
    recurrence: fromApi(item.recurrence) as PaymentReminder['recurrence'],
    paidAt: item.paidAt?.slice(0, 10) ?? null,
    paymentMethod: item.paymentMethod ?? undefined,
    receipt: item.receipt ?? undefined,
    createdAt: item.createdAt.slice(0, 10),
  }
}

function toApiInput(input: PaymentReminderInput) {
  return {
    ...input,
    category: toApi(input.category),
    priority: toApi(input.priority),
    recurrence: toApi(input.recurrence),
  }
}

class PaymentAssistantService {
  async list(): Promise<PaymentReminder[]> {
    const items = await api.get<ApiPayment[]>('/payments')
    return items.map(mapPayment)
  }

  async create(input: PaymentReminderInput): Promise<PaymentReminder> {
    const item = await api.post<ApiPayment>('/payments', toApiInput(input))
    return mapPayment(item)
  }

  async update(id: string, patch: Partial<PaymentReminder>): Promise<PaymentReminder> {
    const payload = { ...patch } as Record<string, unknown>
    if (patch.category) payload.category = toApi(patch.category)
    if (patch.priority) payload.priority = toApi(patch.priority)
    if (patch.recurrence) payload.recurrence = toApi(patch.recurrence)
    const item = await api.patch<ApiPayment>(`/payments/${id}`, payload)
    return mapPayment(item)
  }

  async markAsPaid(id: string, method?: string): Promise<PaymentReminder> {
    const item = await api.patch<ApiPayment>(`/payments/${id}/pay`, { paymentMethod: method ?? 'Pix' })
    return mapPayment(item)
  }

  async markAsPending(id: string): Promise<PaymentReminder> {
    const item = await api.patch<ApiPayment>(`/payments/${id}/pending`)
    return mapPayment(item)
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/payments/${id}`)
  }

  async summarize(month: string): Promise<MonthlySummary> {
    const summary = await api.get<MonthlySummary>(`/payments/summary?month=${encodeURIComponent(month)}`)
    const [year, monthNumber] = month.split('-')
    const label = new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
    return { ...summary, label: label.charAt(0).toUpperCase() + label.slice(1) }
  }
}

export const paymentAssistantService = new PaymentAssistantService()
