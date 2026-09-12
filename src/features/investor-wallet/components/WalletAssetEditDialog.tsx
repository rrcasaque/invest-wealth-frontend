import { useState } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CurrencyInput, Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import type { WalletAsset } from '../types'

interface WalletAssetEditDialogProps {
  asset: WalletAsset
  onUpdate: (id: string, input: Record<string, unknown>) => Promise<void>
}

interface FormState {
  name: string
  notes: string
  ticker: string
  cnpj: string
  institution: string
  amount: number
  rate: string
  maturity: string
  quantity: string
  currentPrice: number
  currentValue: number
  symbol: string
  purchasePrice: number
  propertyValue: number
  rentValue: number
  agencyFee: string
}

function toNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function initialState(asset: WalletAsset): FormState {
  return {
    name: asset.name,
    notes: asset.notes ?? '',
    ticker: asset.type === 'fii' || asset.type === 'acao' ? asset.ticker : '',
    cnpj: asset.type === 'fii' || asset.type === 'acao' ? asset.cnpj ?? '' : '',
    institution:
      asset.type === 'renda-fixa' || asset.type === 'fii' || asset.type === 'acao'
        ? asset.institution ?? ''
        : '',
    amount: asset.type === 'renda-fixa' ? asset.amount : 0,
    rate: asset.type === 'renda-fixa' ? String(asset.rate) : '',
    maturity: asset.type === 'renda-fixa' ? asset.maturity ?? '' : '',
    quantity:
      asset.type === 'cripto' || asset.type === 'fii' || asset.type === 'acao'
        ? String(asset.quantity)
        : '',
    currentPrice:
      asset.type === 'fii' || asset.type === 'acao' ? asset.currentPrice ?? 0 : 0,
    currentValue:
      asset.type === 'fii' || asset.type === 'acao' ? asset.currentValue ?? 0 : 0,
    symbol: asset.type === 'cripto' ? asset.symbol : '',
    purchasePrice: asset.type === 'cripto' ? asset.purchasePrice : 0,
    propertyValue: asset.type === 'aluguel' ? asset.propertyValue : 0,
    rentValue: asset.type === 'aluguel' ? asset.rentValue : 0,
    agencyFee: asset.type === 'aluguel' ? String(asset.agencyFee) : '',
  }
}

export function WalletAssetEditDialog({ asset, onUpdate }: WalletAssetEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(() => initialState(asset))

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const isValid = form.name.trim() !== '' && (() => {
    switch (asset.type) {
      case 'fii':
      case 'acao':
        return form.ticker.trim() !== '' && toNumber(form.quantity) > 0
      case 'renda-fixa':
        return form.institution.trim() !== '' && form.amount > 0
      case 'cripto':
        return form.symbol.trim() !== '' && toNumber(form.quantity) > 0 && form.purchasePrice > 0
      case 'aluguel':
        return form.propertyValue > 0 && form.rentValue > 0 && toNumber(form.agencyFee) >= 0
    }
  })()

  const buildInput = (): Record<string, unknown> => {
    const common = { name: form.name.trim(), notes: form.notes.trim() }
    switch (asset.type) {
      case 'fii':
      case 'acao':
        return {
          ...common,
          ticker: form.ticker.trim().toUpperCase(),
          cnpj: form.cnpj.trim(),
          institution: form.institution.trim(),
          quantity: toNumber(form.quantity),
          currentPrice: form.currentPrice,
          currentValue: form.currentValue,
        }
      case 'renda-fixa':
        return {
          ...common,
          fixedIncomeInstitution: form.institution.trim(),
          fixedIncomeAmount: form.amount,
          fixedIncomeRate: toNumber(form.rate),
          maturity: form.maturity || null,
        }
      case 'cripto':
        return {
          ...common,
          ticker: form.symbol.trim().toUpperCase(),
          quantity: toNumber(form.quantity),
          purchasePrice: form.purchasePrice,
        }
      case 'aluguel':
        return {
          ...common,
          propertyValue: form.propertyValue,
          rentValue: form.rentValue,
          agencyFee: toNumber(form.agencyFee),
        }
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onUpdate(asset.id, buildInput())
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title={`Editar ${asset.name}`}
          aria-label={`Editar ${asset.name}`}
          onClick={() => setForm(initialState(asset))}
        >
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar ativo</DialogTitle>
          <DialogDescription>Atualize os dados de {asset.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-name-${asset.id}`}>Nome / Descrição *</Label>
            <Input
              id={`edit-name-${asset.id}`}
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              required
            />
          </div>

          {(asset.type === 'fii' || asset.type === 'acao') && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-ticker-${asset.id}`}>Ticker *</Label>
                  <Input
                    id={`edit-ticker-${asset.id}`}
                    value={form.ticker}
                    onChange={(event) => set('ticker', event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-quantity-${asset.id}`}>Quantidade *</Label>
                  <Input
                    id={`edit-quantity-${asset.id}`}
                    type="number"
                    min="0"
                    step="0.00000001"
                    value={form.quantity}
                    onChange={(event) => set('quantity', event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`edit-institution-${asset.id}`}>Instituição</Label>
                <Input
                  id={`edit-institution-${asset.id}`}
                  value={form.institution}
                  onChange={(event) => set('institution', event.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CurrencyInput
                  id={`edit-current-price-${asset.id}`}
                  prefix="R$"
                  aria-label="Preço atual"
                  value={form.currentPrice}
                  onValueChange={(value) => set('currentPrice', value)}
                />
                <CurrencyInput
                  id={`edit-current-value-${asset.id}`}
                  prefix="R$"
                  aria-label="Valor atual"
                  value={form.currentValue}
                  onValueChange={(value) => set('currentValue', value)}
                />
              </div>
            </>
          )}

          {asset.type === 'renda-fixa' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`edit-institution-${asset.id}`}>Instituição *</Label>
                <Input
                  id={`edit-institution-${asset.id}`}
                  value={form.institution}
                  onChange={(event) => set('institution', event.target.value)}
                  required
                />
              </div>
              <CurrencyInput
                id={`edit-amount-${asset.id}`}
                prefix="R$"
                aria-label="Valor aplicado"
                value={form.amount}
                onValueChange={(value) => set('amount', value)}
                required
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-rate-${asset.id}`}>Taxa (% a.a.)</Label>
                  <Input
                    id={`edit-rate-${asset.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rate}
                    onChange={(event) => set('rate', event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-maturity-${asset.id}`}>Vencimento</Label>
                  <Input
                    id={`edit-maturity-${asset.id}`}
                    type="date"
                    value={form.maturity}
                    onChange={(event) => set('maturity', event.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {asset.type === 'cripto' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`edit-symbol-${asset.id}`}>Símbolo *</Label>
                <Input
                  id={`edit-symbol-${asset.id}`}
                  value={form.symbol}
                  onChange={(event) => set('symbol', event.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-quantity-${asset.id}`}>Quantidade *</Label>
                  <Input
                    id={`edit-quantity-${asset.id}`}
                    type="number"
                    min="0"
                    step="0.00000001"
                    value={form.quantity}
                    onChange={(event) => set('quantity', event.target.value)}
                    required
                  />
                </div>
                <CurrencyInput
                  id={`edit-purchase-price-${asset.id}`}
                  prefix="R$"
                  aria-label="Preço de compra"
                  value={form.purchasePrice}
                  onValueChange={(value) => set('purchasePrice', value)}
                  required
                />
              </div>
            </>
          )}

          {asset.type === 'aluguel' && (
            <>
              <CurrencyInput
                id={`edit-property-value-${asset.id}`}
                prefix="R$"
                aria-label="Valor do imóvel"
                value={form.propertyValue}
                onValueChange={(value) => set('propertyValue', value)}
                required
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CurrencyInput
                  id={`edit-rent-value-${asset.id}`}
                  prefix="R$"
                  aria-label="Aluguel/mês"
                  value={form.rentValue}
                  onValueChange={(value) => set('rentValue', value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`edit-agency-fee-${asset.id}`}>Taxa imobiliária (%)</Label>
                  <Input
                    id={`edit-agency-fee-${asset.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.agencyFee}
                    onChange={(event) => set('agencyFee', event.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-notes-${asset.id}`}>Observações</Label>
            <Input
              id={`edit-notes-${asset.id}`}
              value={form.notes}
              onChange={(event) => set('notes', event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
