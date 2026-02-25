import { TargetBrandsList } from './TargetBrandsList'
import { KPICard } from '@/components/data-display/KPICard'
import { KPICardGrid } from '@/components/data-display/KPICardGrid'
import { PageSection } from '@/components/layout/PageSection'
import { formatCurrency } from '@/utils/format'
import { sum } from '@/utils/calculations'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TargetsTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.targets

  const liveRevenue = sum(data.filter((b) => b.status === 'live').map((b) => b.estimatedRevenue))
  const liveTargetCount = data.length

  return (
    <div className="space-y-6">
      <KPICardGrid columns={2}>
        <KPICard label="Gerçekleşen Ciro" value={formatCurrency(liveRevenue)} />
        <KPICard label="Canlıya Alma Hedefi" value={`${liveTargetCount} adet`} />
      </KPICardGrid>

      <PageSection title="Hedeflenen Markalar" description="Canlıya alma hedefleri ve durumlar">
        <TargetBrandsList data={data} />
      </PageSection>
    </div>
  )
}
