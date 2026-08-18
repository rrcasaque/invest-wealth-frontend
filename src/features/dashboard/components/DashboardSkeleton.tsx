import { PageContainer, PageHeader } from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <PageContainer maxWidth="wide" className="space-y-4 sm:space-y-6">
      <PageHeader>
        <div className="space-y-2">
          <Skeleton className="h-9 w-3/4 max-w-72" />
          <Skeleton className="h-4 w-full max-w-96" />
        </div>
        <Skeleton className="h-6 w-32 rounded-full" />
      </PageHeader>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-64" />
    </PageContainer>
  )
}
