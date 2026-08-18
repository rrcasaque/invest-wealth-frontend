import * as React from 'react'
import { cn } from '@/shared/utils/cn'

/**
 * Outer page wrapper that applies responsive horizontal padding,
 * a max content width and vertical rhythm.
 */
export const PageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Constrain content to a comfortable reading width. */
    maxWidth?: 'default' | 'wide' | 'full'
  }
>(({ className, maxWidth = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 md:px-10 md:py-8',
      maxWidth === 'default' && 'max-w-7xl',
      maxWidth === 'wide' && 'max-w-[1600px]',
      maxWidth === 'full' && 'max-w-none',
      className,
    )}
    {...props}
  />
))
PageContainer.displayName = 'PageContainer'

export const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col gap-3 pb-6 md:flex-row md:items-end md:justify-between md:gap-4',
      className,
    )}
    {...props}
  />
))
PageHeader.displayName = 'PageHeader'

export const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn('font-heading text-2xl font-bold tracking-tight md:text-3xl', className)}
    {...props}
  />
))
PageTitle.displayName = 'PageTitle'

export const PageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground md:text-base', className)}
    {...props}
  />
))
PageDescription.displayName = 'PageDescription'
