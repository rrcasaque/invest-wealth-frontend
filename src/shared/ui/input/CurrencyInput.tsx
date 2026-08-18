import * as React from 'react'
import { cn } from '@/shared/utils/cn'
import { formatBRLInput, parseBRLToNumber } from '@/shared/utils'

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  /** Valor em reais (número). */
  value: number
  /** Chamado com o valor numérico em reais conforme o usuário digita. */
  onValueChange: (value: number) => void
  /** Quando definido, exibe um prefixo (ex: "R$"). */
  prefix?: string
}

/**
 * Input de moeda com máscara pt-BR (ex: `10.000,00`).
 *
 * O valor é controlado como `number` (em reais); a máscara é aplicada
 * apenas na apresentação. Dígitos são acumulados em centavos para
 * preservar o que o usuário já digitou ao editar o meio do campo.
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, prefix, className, onFocus, onBlur, ...props }, ref) => {
    // Acumula os centavos digitados pelo usuário para edição estável.
    const centsRef = React.useRef<number>(Math.round(value * 100))
    const [display, setDisplay] = React.useState<string>(() => formatBRLInput(value))
    const isFocusedRef = React.useRef(false)

    // Sincroniza o estado interno quando o valor externo muda (ex: reset do form)
    // e o campo não está em foco.
    React.useEffect(() => {
      if (isFocusedRef.current) return
      centsRef.current = Math.round(value * 100)
      setDisplay(formatBRLInput(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mantém apenas dígitos do valor bruto do input
      const digits = e.target.value.replace(/\D/g, '')
      const newCents = digits === '' ? 0 : Number(digits)
      centsRef.current = newCents
      const newValue = newCents / 100
      setDisplay(formatBRLInput(newValue))
      onValueChange(newValue)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true
      // Seleciona tudo para facilitar a reedição
      e.target.select()
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false
      // Reformat a partir do valor canônico para garantir consistência
      const v = parseBRLToNumber(e.target.value)
      centsRef.current = Math.round(v * 100)
      setDisplay(formatBRLInput(v))
      onBlur?.(e)
    }

    return (
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-surface-container-high py-2 text-sm text-foreground ring-offset-background transition-colors',
            'placeholder:text-muted-foreground/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[invalid=true]:border-destructive data-[invalid=true]:focus-visible:ring-destructive',
            prefix ? 'pl-9 pr-3' : 'px-3',
            'font-mono',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'
