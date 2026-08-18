import type { PaymentReminder } from '../types/payment'

const STORAGE_KEY = 'investwealth-payments'

export function getStoredPayments(): PaymentReminder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PaymentReminder[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function storePayments(reminders: PaymentReminder[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  } catch {
    /* localStorage might be unavailable (private mode, SSR) */
  }
}

export function clearPayments(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
