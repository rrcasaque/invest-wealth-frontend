import type { ExpectativeDividendMonth } from '../types/expectative-dividend'

/** Compatibilidade temporária: expectativas agora são sempre obtidas da API. */
export function getStoredExpectativeDividendMonth(): ExpectativeDividendMonth | null {
  return null
}

export function storeExpectativeDividendMonth(_value: ExpectativeDividendMonth): void {
  // Persistência local removida; o backend/API é a fonte de verdade.
}

export function clearStoredExpectativeDividendMonth(): void {
  // Mantido apenas para compatibilidade com imports antigos.
}
