import { useCallback, useEffect, useState } from 'react'
import { paymentAssistantService } from '../services/payment-assistant.service'
import type {
  MonthlySummary,
  PaymentReminder,
  PaymentReminderInput,
} from '../types'

export type PaymentAssistantStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UsePaymentAssistantResult {
  reminders: PaymentReminder[]
  summary: MonthlySummary | null
  status: PaymentAssistantStatus
  error: string | null
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  create: (input: PaymentReminderInput) => Promise<void>
  update: (id: string, patch: Partial<PaymentReminder>) => Promise<void>
  markAsPaid: (id: string, method?: string) => Promise<void>
  markAsPending: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function usePaymentAssistant(): UsePaymentAssistantResult {
  const [reminders, setReminders] = useState<PaymentReminder[]>([])
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [status, setStatus] = useState<PaymentAssistantStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  )

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        paymentAssistantService.list(),
        paymentAssistantService.summarize(selectedMonth),
      ])
      setReminders(list)
      setSummary(sum)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar lembretes.')
      setStatus('error')
    }
  }, [selectedMonth])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: PaymentReminderInput) => {
      await paymentAssistantService.create(input)
      await refresh()
    },
    [refresh],
  )

  const update = useCallback(
    async (id: string, patch: Partial<PaymentReminder>) => {
      await paymentAssistantService.update(id, patch)
      await refresh()
    },
    [refresh],
  )

  const markAsPaid = useCallback(
    async (id: string, method?: string) => {
      await paymentAssistantService.markAsPaid(id, method)
      await refresh()
    },
    [refresh],
  )

  const markAsPending = useCallback(
    async (id: string) => {
      await paymentAssistantService.markAsPending(id)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await paymentAssistantService.remove(id)
      await refresh()
    },
    [refresh],
  )

  return {
    reminders,
    summary,
    status,
    error,
    selectedMonth,
    setSelectedMonth,
    create,
    update,
    markAsPaid,
    markAsPending,
    remove,
    refresh,
  }
}
