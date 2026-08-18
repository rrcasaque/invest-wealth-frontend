import * as React from 'react'
import { FileSpreadsheet, Loader2, Upload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { useToast } from '@/shared/ui/toast'
import { importPortfolioFile } from '@/shared/services/portfolio-import.service'
import { storePortfolio } from '@/shared/storage/portfolio-storage'
import type { PortfolioImportResult, PortfolioPosition } from '@/shared/types/portfolio'
import { formatCurrency } from '@/shared/utils'

type ImportStatus = 'idle' | 'parsing' | 'success' | 'error'

interface B3ImportDialogProps {
  onImported?: () => void
}

export function B3ImportDialog({ onImported }: B3ImportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState<ImportStatus>('idle')
  const [result, setResult] = React.useState<PortfolioImportResult | null>(null)
  const [positions, setPositions] = React.useState<PortfolioPosition[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setPositions([])
    setErrorMsg(null)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('parsing')
    setErrorMsg(null)
    try {
      const importResult = await importPortfolioFile(file)
      if (importResult.positions.length === 0) {
        throw new Error('Nenhuma posição encontrada na planilha. Verifique se o arquivo é um relatório consolidado mensal da B3.')
      }
      setResult(importResult)
      setPositions(importResult.positions)
      setStatus('success')
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Falha ao processar a planilha.',
      )
      setStatus('error')
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTimeout(reset, 200)
    }
  }

  const handleRemovePosition = (ticker: string) => {
    setPositions((current) => current.filter((position) => position.ticker !== ticker))
  }

  const totalValue = positions.reduce((sum, position) => sum + position.value, 0)

  const handleConfirm = () => {
    if (!result || positions.length === 0) return
    storePortfolio({ ...result, positions, totalValue })
    toast({
      title: 'Carteira importada',
      description: `${positions.length} ativos salvos a partir de ${result.fileName}.`,
      variant: 'success',
    })
    onImported?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-surface-container-high px-3 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap w-full"
        >
          <FileSpreadsheet className="size-3.5 shrink-0" />
          Importar B3
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 shrink-0 border-b border-border bg-surface-container p-4 pb-4 sm:p-6">
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            Importação de Carteira B3
          </DialogTitle>
          <DialogDescription>
            Selecione o relatório consolidado mensal (.xlsx) exportado da B3 para importar sua carteira de fundos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 pt-4 sm:p-6">

        {(status === 'idle' || status === 'parsing') && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-surface-container-low/50 p-10 text-center">
            {status === 'parsing' ? (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando planilha...</p>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formato aceito: .xlsx (relatório consolidado mensal da B3)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={status !== 'idle'}
                >
                  <Upload className="size-4" />
                  Selecionar arquivo
                </Button>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-10 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm text-destructive">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Tentar novamente
            </Button>
          </div>
        )}

        {status === 'success' && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
                <CheckCircle2 className="size-5 text-success" />
                <span className="text-sm font-medium text-success">
                  {positions.length} ativo(s) na carteira
                </span>
              </div>

              <div className="rounded-lg border border-border bg-surface-container-low/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor Total da Carteira
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold text-foreground">
                  {formatCurrency(totalValue, { currency: 'BRL' })}
                </p>
              </div>

              <div className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface-container-low/50 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ativos detectados
                  </p>
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Remova ativos indesejados antes de confirmar
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Ticker</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Cotas</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.ticker}>
                          <TableCell className="whitespace-nowrap font-mono font-semibold">
                            {position.ticker}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground sm:max-w-[260px]">
                            {position.product}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono">
                            {position.shares}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono">
                            {formatCurrency(position.price, { currency: 'BRL' })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono font-semibold">
                            {formatCurrency(position.value, { currency: 'BRL' })}
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => handleRemovePosition(position.ticker)}
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`Remover ${position.ticker}`}
                              title={`Remover ${position.ticker}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={reset}>
                  Importar outro
                </Button>
                <Button onClick={handleConfirm} disabled={positions.length === 0}>
                  Confirmar Importação
                </Button>
              </div>
            </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
