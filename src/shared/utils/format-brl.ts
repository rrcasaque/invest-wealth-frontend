/**
 * Formata um valor numérico (em reais) para a string de moeda pt-BR
 * usada nos inputs mascarados: `10000` → `"10.000,00"`.
 *
 * Recebe o valor em reais (não em centavos) e retorna apenas os
 * dígitos formatados, sem símbolo de moeda — adequado para campos
 * de formulário onde o prefixo "R$" é exibido separadamente.
 */
export function formatBRLInput(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0,00'
  const fixed = value.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withSeparators},${decPart}`
}

/**
 * Converte a string mascarada de volta para número em reais.
 * `"10.000,00"` → `10000`. Retorna `0` quando a string é inválida/vazia.
 */
export function parseBRLToNumber(masked: string): number {
  if (!masked) return 0
  // Remove tudo que não for dígito, vírgula ou ponto
  const cleaned = masked.replace(/[^\d.,]/g, '')
  if (!cleaned) return 0
  // Trata vírgula como separador decimal: remove os pontos (milhar) e troca vírgula por ponto
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}
