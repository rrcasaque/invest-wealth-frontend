import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CurrencyInput } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { formatCurrency, cn } from '@/shared/utils'

interface InvestmentCapitalFormProps {
  onCalculate: (newCapital: number) => void
  isCalculating: boolean
  currentValue?: number
  projectedValue?: number
}

export function InvestmentCapitalForm({
  onCalculate,
  isCalculating,
  currentValue,
  projectedValue,
}: InvestmentCapitalFormProps) {
  const [capital, setCapital] = useState<number>(250000)
  const [touched, setTouched] = useState(false)

  const isValid = capital > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onCalculate(capital)
  }

  return (
    <Card className="glass-panel relative overflow-hidden">
      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-primary/5 to-transparent"
      />
      <CardContent className="relative z-10 flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Novo Capital de Investimento</h3>
            <p className="text-sm text-muted-foreground">
              Insira o valor para distribuir pelo portfólio alvo.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="w-full max-w-sm">
              <CurrencyInput
                className="h-12 text-lg"
                prefix="R$"
                value={capital}
                onValueChange={setCapital}
                aria-label="Novo capital de investimento em reais"
                aria-invalid={touched && !isValid}
              />
            </div>
            <Button
              type="submit"
              variant="success"
              size="lg"
              disabled={isCalculating}
              className="h-12 whitespace-nowrap"
            >
              <Calculator className="size-4" />
              {isCalculating ? 'Calculando...' : 'Calcular Distribuição'}
            </Button>
          </form>
          {touched && !isValid && (
            <p className="text-xs text-destructive">O valor deve ser um número positivo.</p>
          )}
        </div>

        <div className="flex gap-4 border-t border-border pt-4 md:border-t-0 md:border-l md:pl-6 sm:gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Valor Total Atual
            </p>
            <p className="font-heading text-lg font-bold font-mono sm:text-xl">
              {currentValue !== undefined ? formatCurrency(currentValue, { currency: 'BRL' }) : '—'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Projeção Pós-Investimento
            </p>
            <p className={cn('font-heading text-lg font-bold font-mono text-primary sm:text-xl')}>
              {projectedValue !== undefined ? formatCurrency(projectedValue, { currency: 'BRL' }) : '—'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
