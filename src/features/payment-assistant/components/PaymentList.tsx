import {
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Calendar,
  Repeat,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { formatCurrency, formatDate } from '@/shared/utils'
import type { PaymentReminder } from '../types'
import {
  paymentCategoryColor,
  paymentCategoryLabel,
  paymentPriorityColor,
  paymentPriorityLabel,
  paymentRecurrenceLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from './types-labels'

interface PaymentListProps {
  reminders: PaymentReminder[]
  onMarkAsPaid: (id: string) => void
  onMarkAsPending: (id: string) => void
  onRemove: (id: string) => void
}

export function PaymentList({
  reminders,
  onMarkAsPaid,
  onMarkAsPending,
  onRemove,
}: PaymentListProps) {
  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground">
            <Calendar className="size-6" />
          </div>
          <div>
            <p className="font-medium text-foreground">Nenhum lembrete encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie um novo lembrete ou ajuste os filtros para ver pagamentos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Listagem Completa ({reminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: card layout */}
        <div className="flex flex-col divide-y divide-border md:hidden">
          {reminders.map((reminder) => (
            <PaymentCard
              key={reminder.id}
              reminder={reminder}
              onMarkAsPaid={onMarkAsPaid}
              onMarkAsPending={onMarkAsPending}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <PaymentRow
                  key={reminder.id}
                  reminder={reminder}
                  onMarkAsPaid={onMarkAsPaid}
                  onMarkAsPending={onMarkAsPending}
                  onRemove={onRemove}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentCard({
  reminder,
  onMarkAsPaid,
  onMarkAsPending,
  onRemove,
}: {
  reminder: PaymentReminder
  onMarkAsPaid: (id: string) => void
  onMarkAsPending: (id: string) => void
  onRemove: (id: string) => void
}) {
  const isPaid = reminder.status === 'paid'
  const isOverdue = reminder.status === 'overdue'

  return (
    <div className={`flex flex-col gap-3 p-4 ${isPaid ? 'opacity-60' : ''}`}>
      {/* Top row: title + value */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className={`font-medium ${isPaid ? 'line-through' : ''}`}>
            {reminder.title}
          </span>
          {reminder.notes && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3 shrink-0" />
              <span className="truncate">{reminder.notes}</span>
            </span>
          )}
        </div>
        <span className="shrink-0 font-mono font-semibold">
          {formatCurrency(reminder.amount, { currency: 'BRL' })}
        </span>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={paymentStatusColor[reminder.status]}>
          {isPaid && <CheckCircle2 className="mr-1 size-3" />}
          {isOverdue && <AlertTriangle className="mr-1 size-3" />}
          {!isPaid && !isOverdue && <Clock className="mr-1 size-3" />}
          {paymentStatusLabel[reminder.status]}
        </Badge>
        <Badge variant="outline" className={paymentCategoryColor[reminder.category]}>
          {paymentCategoryLabel[reminder.category]}
        </Badge>
        <Badge variant="outline" className={paymentPriorityColor[reminder.priority]}>
          {paymentPriorityLabel[reminder.priority]}
        </Badge>
      </div>

      {/* Date + recurrence */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span className={isOverdue ? 'font-semibold text-destructive' : ''}>
            {formatDate(reminder.dueDate, 'short')}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Repeat className="size-3" />
          {paymentRecurrenceLabel[reminder.recurrence]}
        </span>
        {reminder.paidAt && (
          <span className="text-success">
            Pago em {formatDate(reminder.paidAt, 'short')}
            {reminder.paymentMethod ? ` • ${reminder.paymentMethod}` : ''}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isPaid ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onMarkAsPending(reminder.id)}
          >
            <RotateCcw className="size-3.5" />
            Reverter
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-success hover:text-success"
            onClick={() => onMarkAsPaid(reminder.id)}
          >
            <CheckCircle2 className="size-3.5" />
            Marcar pago
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(reminder.id)}
        >
          <Trash2 className="size-3.5" />
          Remover
        </Button>
      </div>
    </div>
  )
}

function PaymentRow({
  reminder,
  onMarkAsPaid,
  onMarkAsPending,
  onRemove,
}: {
  reminder: PaymentReminder
  onMarkAsPaid: (id: string) => void
  onMarkAsPending: (id: string) => void
  onRemove: (id: string) => void
}) {
  const isPaid = reminder.status === 'paid'
  const isOverdue = reminder.status === 'overdue'

  return (
    <TableRow className={isPaid ? 'opacity-60' : undefined}>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className={`font-medium ${isPaid ? 'line-through' : ''}`}>
            {reminder.title}
          </span>
          {reminder.notes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3" />
              {reminder.notes}
            </span>
          )}
          {reminder.paidAt && (
            <span className="text-xs text-success">
              Pago em {formatDate(reminder.paidAt, 'short')}
              {reminder.paymentMethod ? ` • ${reminder.paymentMethod}` : ''}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={paymentCategoryColor[reminder.category]}>
          {paymentCategoryLabel[reminder.category]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className={isOverdue ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
            {formatDate(reminder.dueDate, 'short')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={paymentPriorityColor[reminder.priority]}>
          {paymentPriorityLabel[reminder.priority]}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Repeat className="size-3" />
          {paymentRecurrenceLabel[reminder.recurrence]}
        </span>
      </TableCell>
      <TableCell className="text-right font-mono font-semibold">
        {formatCurrency(reminder.amount, { currency: 'BRL' })}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={paymentStatusColor[reminder.status]}>
          {isPaid && <CheckCircle2 className="mr-1 size-3" />}
          {isOverdue && <AlertTriangle className="mr-1 size-3" />}
          {!isPaid && !isOverdue && <Clock className="mr-1 size-3" />}
          {paymentStatusLabel[reminder.status]}
        </Badge>
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex items-center justify-end gap-1">
          {isPaid ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onMarkAsPending(reminder.id)}
              title="Reverter para pendente"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-success hover:text-success"
              onClick={() => onMarkAsPaid(reminder.id)}
              title="Marcar como pago"
            >
              <CheckCircle2 className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onRemove(reminder.id)}
            title="Remover lembrete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
