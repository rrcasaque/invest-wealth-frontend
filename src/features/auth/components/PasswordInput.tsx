import * as React from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input, type InputProps } from '@/shared/ui/input'
import { cn } from '@/shared/utils/cn'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Show the leading lock icon. */
  showLeadingIcon?: boolean
}

/**
 * Password input with a built-in show/hide toggle.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showLeadingIcon = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const inputId = React.useId()
    return (
      <div className="relative">
        {showLeadingIcon && (
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        )}
        <Input
          id={inputId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(showLeadingIcon && 'pl-9', 'pr-10 font-mono', className)}
          autoComplete="current-password"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={0}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
