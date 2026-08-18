import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Play, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CurrencyInput, Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { simulationSchema, type SimulationValues } from '../schemas'
import type { SimulationParameters } from '../types'

interface SimulationParametersFormProps {
  onRun: (params: SimulationParameters) => void
  isRunning: boolean
  defaultValues?: Partial<SimulationValues>
}

const initialValues: SimulationValues = {
  initialInvestment: 50000,
  monthlyContribution: 1500,
  years: 20,
  expectedReturn: 7.5,
  dividendYield: 2.1,
  reinvestDividends: true,
}

export function SimulationParametersForm({
  onRun,
  isRunning,
  defaultValues,
}: SimulationParametersFormProps) {
  const form = useForm<SimulationValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: { ...initialValues, ...defaultValues },
  })

  const onSubmit = (values: SimulationValues) => {
    onRun({
      initialInvestment: values.initialInvestment,
      monthlyContribution: values.monthlyContribution,
      years: values.years,
      expectedReturn: values.expectedReturn,
      dividendYield: values.dividendYield,
      reinvestDividends: values.reinvestDividends,
    })
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-4">
        <SlidersHorizontal className="size-5 text-primary" />
        <CardTitle className="text-lg">Parâmetros</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-5" noValidate>
          <FormField name="initialInvestment" invalid={!!form.formState.errors.initialInvestment}>
            <FormItem>
              <FormLabel>Investimento Inicial (R$)</FormLabel>
              <FormControl>
                <CurrencyInput
                  prefix="R$"
                  value={form.watch('initialInvestment')}
                  onValueChange={(v) => form.setValue('initialInvestment', v, { shouldValidate: true })}
                  aria-invalid={!!form.formState.errors.initialInvestment}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.initialInvestment?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="monthlyContribution" invalid={!!form.formState.errors.monthlyContribution}>
            <FormItem>
              <FormLabel>Contribuição Mensal (R$)</FormLabel>
              <FormControl>
                <CurrencyInput
                  prefix="R$"
                  value={form.watch('monthlyContribution')}
                  onValueChange={(v) => form.setValue('monthlyContribution', v, { shouldValidate: true })}
                  aria-invalid={!!form.formState.errors.monthlyContribution}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.monthlyContribution?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="years" invalid={!!form.formState.errors.years}>
            <FormItem>
              <FormLabel>Horizonte de Tempo (Anos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  className="font-mono"
                  aria-invalid={!!form.formState.errors.years}
                  {...form.register('years', { valueAsNumber: true })}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.years?.message}</FormMessage>
            </FormItem>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField name="expectedReturn" invalid={!!form.formState.errors.expectedReturn}>
              <FormItem>
                <FormLabel>Retorno Esperado</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      className="pr-8 font-mono"
                      aria-invalid={!!form.formState.errors.expectedReturn}
                      {...form.register('expectedReturn', { valueAsNumber: true })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormControl>
                <FormMessage>{form.formState.errors.expectedReturn?.message}</FormMessage>
              </FormItem>
            </FormField>

            <FormField name="dividendYield" invalid={!!form.formState.errors.dividendYield}>
              <FormItem>
                <FormLabel>Dividendos</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      className="pr-8 font-mono"
                      aria-invalid={!!form.formState.errors.dividendYield}
                      {...form.register('dividendYield', { valueAsNumber: true })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormControl>
                <FormMessage>{form.formState.errors.dividendYield?.message}</FormMessage>
              </FormItem>
            </FormField>
          </div>

          <FormField name="reinvestDividends">
            <FormItem className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-foreground">Reinvestir Dividendos</span>
              <FormControl>
                <Switch
                  checked={form.watch('reinvestDividends')}
                  onCheckedChange={(checked) =>
                    form.setValue('reinvestDividends', checked === true)
                  }
                />
              </FormControl>
            </FormItem>
          </FormField>

          <div className="mt-auto pt-2">
            <Button type="submit" size="lg" disabled={isRunning} className="w-full uppercase tracking-widest">
              <Play className="size-4" />
              {isRunning ? 'Processando...' : 'Executar Simulação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
