import { Activity } from 'lucide-react'
import { appConfig } from '@/shared/config'
import { cn } from '@/shared/utils/cn'

interface AuthBrandProps {
  className?: string
  /** Show the tagline below the brand name. */
  showTagline?: boolean
}

/**
 * InvestWealth brand lockup used at the top of authentication screens.
 */
export function AuthBrand({ className, showTagline = true }: AuthBrandProps) {
  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-lg border border-border bg-surface-container-high text-primary shadow-lg">
        <Activity className="size-6" strokeWidth={2.25} />
      </div>
      <p className="font-heading text-2xl font-bold tracking-tight">{appConfig.name}</p>
      {showTagline && (
        <p className="mt-1 text-sm text-muted-foreground">{appConfig.description}</p>
      )}
    </div>
  )
}
