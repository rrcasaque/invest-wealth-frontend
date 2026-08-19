import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export interface CodeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (value: string) => void
  length?: number
}

/**
 * Input de código numérico de 6 dígitos com máscara automática.
 * Mantém apenas dígitos e limita ao tamanho definido (default 6).
 */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  function CodeInput({ value, onChange, length = 6, className, ...props }, ref) {
    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, length)
      onChange(digits)
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern={`\\d{${length}}`}
        maxLength={length}
        value={value}
        onChange={handle}
        className={cn(
          'w-full rounded-md border border-border bg-transparent px-3 py-2 text-center font-mono text-2xl tracking-[0.5em] uppercase shadow-sm transition-colors',
          'placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
