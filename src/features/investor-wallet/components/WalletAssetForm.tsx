import { useState } from 'react'
import { Plus, Loader2, Briefcase } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CurrencyInput, Input } from '@/shared/ui/input'
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
import { walletTypeLabel } from './types-labels'
import type { WalletAssetInput, WalletAssetType } from '../types'

interface WalletAssetFormProps {
  onCreate: (input: WalletAssetInput) => Promise<void>
}

const TYPE_OPTIONS: WalletAssetType[] = ['renda-fixa', 'cripto', 'aluguel']

interface FormState {
  type: WalletAssetType
  name: string
  notes: string
  // renda-fixa
  institution: string
  amount: number
  rate: string
  maturity: string
  // cripto
  symbol: string
  quantity: string
  purchasePrice: number
  // aluguel
  propertyValue: number
  rentValue: number
  agencyFee: string
}

const initialState: FormState = {
  type: 'renda-fixa',
  name: '',
  notes: '',
  institution: '',
  amount: 0,
  rate: '',
  maturity: '',
  symbol: '',
  quantity: '',
  purchasePrice: 0,
  propertyValue: 0,
  rentValue: 0,
  agencyFee: '',
}

function num(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function WalletAssetForm({ onCreate }: WalletAssetFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(initialState)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isValid = (): boolean => {
    if (!form.name.trim()) return false
    switch (form.type) {
      case 'renda-fixa':
        return !!form.institution.trim() && form.amount > 0
      case 'cripto':
        return !!form.symbol.trim() && num(form.quantity) > 0 && form.purchasePrice > 0
      case 'aluguel':
        return (
          form.propertyValue > 0 &&
          form.rentValue > 0 &&
          num(form.agencyFee) >= 0
        )
    }
  }

  const buildInput = (): WalletAssetInput => {
    const notes = form.notes.trim() || undefined
    switch (form.type) {
      case 'renda-fixa':
        return {
          type: 'renda-fixa',
          name: form.name.trim(),
          institution: form.institution.trim(),
          amount: form.amount,
          rate: num(form.rate),
          maturity: form.maturity || undefined,
          notes,
        }
      case 'cripto':
        return {
          type: 'cripto',
          name: form.name.trim(),
          symbol: form.symbol.trim().toUpperCase(),
          quantity: num(form.quantity),
          purchasePrice: form.purchasePrice,
          notes,
        }
      case 'aluguel':
        return {
          type: 'aluguel',
          name: form.name.trim(),
          propertyValue: form.propertyValue,
          rentValue: form.rentValue,
          agencyFee: num(form.agencyFee),
          notes,
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid()) return
    setIsSubmitting(true)
    try {
      await onCreate(buildInput())
      setOpen(false)
      setForm(initialState)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="whitespace-nowrap">
          <Plus className="size-4" />
          Novo Ativo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            Adicionar Ativo à Carteira
          </DialogTitle>
          <DialogDescription>
            Registre um investimento de renda fixa, criptomoeda ou imóvel para aluguel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de ativo *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => set('type', v as WalletAssetType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {walletTypeLabel[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome / Descrição *</Label>
            <Input
              id="name"
              placeholder={
                form.type === 'renda-fixa'
                  ? 'Ex: Tesouro Selic 2029'
                  : form.type === 'cripto'
                    ? 'Ex: Bitcoin'
                    : 'Ex: Apartamento Centro'
              }
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          {form.type === 'renda-fixa' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="institution">Instituição *</Label>
                <Input
                  id="institution"
                  placeholder="Ex: Banco do Brasil"
                  value={form.institution}
                  onChange={(e) => set('institution', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount">Valor aplicado (R$) *</Label>
                  <CurrencyInput
                    id="amount"
                    prefix="R$"
                    value={form.amount}
                    onValueChange={(v) => set('amount', v)}
                    required
                    aria-label="Valor aplicado em reais"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rate">Taxa (% a.a.)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.rate}
                    onChange={(e) => set('rate', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maturity">Vencimento (opcional)</Label>
                <Input
                  id="maturity"
                  type="date"
                  value={form.maturity}
                  onChange={(e) => set('maturity', e.target.value)}
                />
              </div>
            </>
          )}

          {form.type === 'cripto' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="symbol">Símbolo *</Label>
                <Input
                  id="symbol"
                  placeholder="Ex: BTC"
                  value={form.symbol}
                  onChange={(e) => set('symbol', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="0,00"
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="purchasePrice">Preço de compra (R$) *</Label>
                  <CurrencyInput
                    id="purchasePrice"
                    prefix="R$"
                    value={form.purchasePrice}
                    onValueChange={(v) => set('purchasePrice', v)}
                    required
                    aria-label="Preço de compra unitário em reais"
                  />
                </div>
              </div>
            </>
          )}

          {form.type === 'aluguel' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="propertyValue">Valor total do imóvel (R$) *</Label>
                <CurrencyInput
                  id="propertyValue"
                  prefix="R$"
                  value={form.propertyValue}
                  onValueChange={(v) => set('propertyValue', v)}
                  required
                  aria-label="Valor total do imóvel em reais"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rentValue">Valor do aluguel/mês (R$) *</Label>
                  <CurrencyInput
                    id="rentValue"
                    prefix="R$"
                    value={form.rentValue}
                    onValueChange={(v) => set('rentValue', v)}
                    required
                    aria-label="Valor do aluguel mensal em reais"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="agencyFee">Taxa da imobiliária (%) *</Label>
                  <Input
                    id="agencyFee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0,00"
                    value={form.agencyFee}
                    onChange={(e) => set('agencyFee', e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ex: Resgatável a qualquer momento"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !isValid()}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Adicionar Ativo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
