import { useState } from 'react'
import { Plus, Loader2, CalendarClock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog'
import {
  paymentCategoryLabel,
  paymentPriorityLabel,
  paymentRecurrenceLabel,
} from './types-labels'
import type {
  PaymentCategory,
  PaymentPriority,
  PaymentRecurrence,
  PaymentReminderInput,
} from '../types'

interface PaymentReminderFormProps {
  onCreate: (input: PaymentReminderInput) => Promise<void>
}

export function PaymentReminderForm({ onCreate }: PaymentReminderFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<PaymentReminderInput>({
    title: '',
    notes: '',
    category: 'conta',
    amount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'medium',
    recurrence: 'monthly',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || form.amount <= 0) return
    setIsSubmitting(true)
    try {
      await onCreate({
        ...form,
        title: form.title.trim(),
        amount: Number(form.amount),
      })
      setOpen(false)
      setForm({
        title: '',
        notes: '',
        category: 'conta',
        amount: 0,
        dueDate: new Date().toISOString().slice(0, 10),
        priority: 'medium',
        recurrence: 'monthly',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="whitespace-nowrap">
          <Plus className="size-4" />
          Novo Lembrete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" />
            Novo Lembrete de Pagamento
          </DialogTitle>
          <DialogDescription>
            Defina um pagamento recorrente ou único com data de vencimento e prioridade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Descrição *</Label>
            <Input
              id="title"
              placeholder="Ex: Conta de Luz"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.amount || ''}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                required
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as PaymentCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(paymentCategoryLabel) as [string, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as PaymentPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(paymentPriorityLabel) as [string, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Recorrência</Label>
              <Select
                value={form.recurrence}
                onValueChange={(v) => setForm({ ...form, recurrence: v as PaymentRecurrence })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(paymentRecurrenceLabel) as [string, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ex: CPFL Energia — residência"
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !form.title.trim()}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Criar Lembrete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
