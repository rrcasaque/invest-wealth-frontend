import { PageHeader, PageTitle, PageDescription } from '@/shared/layout'
import { LiveMarketStatus } from './LiveMarketStatus'

interface DashboardHeaderProps {
  title: string
  description: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <PageHeader>
      <div>
        <PageTitle>{title}</PageTitle>
        <PageDescription>{description}</PageDescription>
      </div>
      <LiveMarketStatus className="hidden sm:inline-flex" />
    </PageHeader>
  )
}
