import { evaluatePasswordStrength, type PasswordStrength } from '../schemas'
import { cn } from '@/shared/utils/cn'

interface PasswordStrengthProps {
  password: string
  className?: string
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; segments: number; tone: string }
> = {
  weak: { label: 'Fraca', segments: 1, tone: 'bg-destructive' },
  medium: { label: 'Média', segments: 2, tone: 'bg-warning' },
  strong: { label: 'Forte', segments: 3, tone: 'bg-success' },
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = evaluatePasswordStrength(password)
  const config = strengthConfig[strength]
  return (
    <div className={cn('flex items-center gap-2', className)} aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 overflow-hidden rounded-full bg-outline-variant/30 transition-colors',
              index < config.segments && config.tone,
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  )
}
