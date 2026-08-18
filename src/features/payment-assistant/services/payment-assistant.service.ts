import type {
  MonthlySummary,
  PaymentReminder,
  PaymentReminderInput,
} from '../types'
import { getStoredPayments, storePayments } from '@/shared/storage/payment-storage'

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function read(): PaymentReminder[] {
  return getStoredPayments()
}

function write(reminders: PaymentReminder[]): void {
  storePayments(reminders)
}

/**
 * Serviço de Assistente de Pagamentos.
 *
 * Persiste os lembretes em localStorage. Os métodos são async para
 * manter compatibilidade com a interface do hook e simular latência.
 */
class PaymentAssistantService {
  async list(): Promise<PaymentReminder[]> {
    await delay(150)
    return [...read()].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }

  async create(input: PaymentReminderInput): Promise<PaymentReminder> {
    await delay(200)
    const reminder: PaymentReminder = {
      id: uuid(),
      ...input,
      status: 'pending',
      paidAt: null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    const reminders = read()
    reminders.push(reminder)
    write(reminders)
    return reminder
  }

  async update(id: string, patch: Partial<PaymentReminder>): Promise<PaymentReminder> {
    await delay(150)
    const reminders = read()
    const idx = reminders.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Lembrete não encontrado.')
    reminders[idx] = { ...reminders[idx], ...patch }
    write(reminders)
    return reminders[idx]
  }

  async markAsPaid(id: string, method?: string): Promise<PaymentReminder> {
    return this.update(id, {
      status: 'paid',
      paidAt: new Date().toISOString().slice(0, 10),
      paymentMethod: method ?? 'Pix',
    })
  }

  async markAsPending(id: string): Promise<PaymentReminder> {
    return this.update(id, {
      status: 'pending',
      paidAt: null,
      paymentMethod: undefined,
    })
  }

  async remove(id: string): Promise<void> {
    await delay(100)
    write(read().filter((r) => r.id !== id))
  }

  async summarize(month: string): Promise<MonthlySummary> {
    await delay(100)
    const monthReminders = read().filter((r) => r.dueDate.startsWith(month))
    const [year, mon] = month.split('-')
    const label = new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString(
      'pt-BR',
      { month: 'long', year: 'numeric' },
    )
    const summary: MonthlySummary = {
      month,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      totalPayments: monthReminders.length,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    }
    for (const r of monthReminders) {
      summary.totalAmount += r.amount
      if (r.status === 'paid') {
        summary.paidCount += 1
        summary.paidAmount += r.amount
      } else if (r.status === 'overdue') {
        summary.overdueCount += 1
        summary.overdueAmount += r.amount
      } else if (r.status === 'pending') {
        summary.pendingCount += 1
        summary.pendingAmount += r.amount
      }
    }
    return summary
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const paymentAssistantService = new PaymentAssistantService()
