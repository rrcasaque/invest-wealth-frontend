import { Trash2, Building2, Coins, Home, FileText, Calendar } from 'lucide-react'
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
import type { WalletAsset } from '../types'
import { getAssetInvestedValue } from '../types'
import { walletTypeColor, walletTypeLabel } from './types-labels'

interface WalletAssetListProps {
  assets: WalletAsset[]
  onRemove: (id: string) => void
}

export function WalletAssetList({ assets, onRemove }: WalletAssetListProps) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="font-medium text-foreground">Nenhum ativo encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione um investimento para começar a acompanhar sua carteira.
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
          Ativos da Carteira ({assets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: card layout */}
        <div className="flex flex-col divide-y divide-border md:hidden">
          {assets.map((asset) => (
            <WalletCard key={asset.id} asset={asset} onRemove={onRemove} />
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ativo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead className="text-right">Valor Aplicado</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-10 pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <WalletRow key={asset.id} asset={asset} onRemove={onRemove} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function AssetIcon({ type }: { type: WalletAsset['type'] }) {
  if (type === 'cripto') return <Coins className="size-4" />
  if (type === 'aluguel') return <Home className="size-4" />
  return <Building2 className="size-4" />
}

function renderDetails(asset: WalletAsset): { label: string; value: string }[] {
  switch (asset.type) {
    case 'renda-fixa':
      return [
        { label: 'Instituição', value: asset.institution },
        { label: 'Taxa', value: `${asset.rate}% a.a.` },
        ...(asset.maturity ? [{ label: 'Vencimento', value: formatDate(asset.maturity, 'short') }] : []),
      ]
    case 'cripto':
      return [
        { label: 'Símbolo', value: asset.symbol },
        { label: 'Quantidade', value: asset.quantity.toString() },
        { label: 'Preço unit.', value: formatCurrency(asset.purchasePrice, { currency: 'BRL' }) },
      ]
    case 'aluguel':
      return [
        { label: 'Aluguel/mês', value: formatCurrency(asset.rentValue, { currency: 'BRL' }) },
        { label: 'Taxa imob.', value: `${asset.agencyFee}%` },
        {
          label: 'Líq./mês',
          value: formatCurrency(
            Math.max(0, asset.rentValue * (1 - asset.agencyFee / 100)),
            { currency: 'BRL' },
          ),
        },
      ]
  }
}

function WalletCard({ asset, onRemove }: { asset: WalletAsset; onRemove: (id: string) => void }) {
  const details = renderDetails(asset)
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="font-medium">{asset.name}</span>
          {asset.notes && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3 shrink-0" />
              <span className="truncate">{asset.notes}</span>
            </span>
          )}
        </div>
        <span className="shrink-0 font-mono font-semibold">
          {formatCurrency(getAssetInvestedValue(asset), { currency: 'BRL' })}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={walletTypeColor[asset.type]}>
          <AssetIcon type={asset.type} />
          <span className="ml-1">{walletTypeLabel[asset.type]}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {details.map((d) => (
          <div key={d.label} className="flex flex-col">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-mono text-foreground">{d.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          {formatDate(asset.createdAt, 'short')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(asset.id)}
        >
          <Trash2 className="size-3.5" />
          Remover
        </Button>
      </div>
    </div>
  )
}

function WalletRow({ asset, onRemove }: { asset: WalletAsset; onRemove: (id: string) => void }) {
  const details = renderDetails(asset)
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{asset.name}</span>
          {asset.notes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3" />
              {asset.notes}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={walletTypeColor[asset.type]}>
          <AssetIcon type={asset.type} />
          <span className="ml-1">{walletTypeLabel[asset.type]}</span>
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {details.map((d) => (
            <span key={d.label}>
              <span className="text-muted-foreground/70">{d.label}: </span>
              <span className="font-mono text-foreground">{d.value}</span>
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono font-semibold">
        {formatCurrency(getAssetInvestedValue(asset), { currency: 'BRL' })}
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1 whitespace-nowrap text-muted-foreground">
          <Calendar className="size-3.5" />
          {formatDate(asset.createdAt, 'short')}
        </span>
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onRemove(asset.id)}
            title="Remover ativo"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
