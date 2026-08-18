import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/utils/cn'

type FormFieldContextValue = {
  name: string
  invalid?: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

export const FormField = ({
  name,
  invalid,
  children,
}: {
  name: string
  invalid?: boolean
  children: React.ReactNode
}) => (
  <FormFieldContext.Provider value={{ name, invalid }}>
    {children}
  </FormFieldContext.Provider>
)

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
  ),
)
FormItem.displayName = 'FormItem'

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label ref={ref} className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)} {...props} />
))
FormLabel.displayName = 'FormLabel'

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Slot ref={ref} className={cn(className)} {...props} />
  ),
)
FormControl.displayName = 'FormControl'

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props} />
))
FormDescription.displayName = 'FormDescription'

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs font-medium text-destructive', className)}
    {...props}
  >
    {children}
  </p>
))
FormMessage.displayName = 'FormMessage'
