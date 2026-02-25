import { GPVMetricsPanel } from './GPVMetricsPanel'
import { LiveDistributionChart } from './LiveDistributionChart'
import { PreviousPlatformChart } from './PreviousPlatformChart'
import { PageSection } from '@/components/layout/PageSection'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function MonthlyOverviewTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.monthlyGPV

  return (
    <div className="space-y-6">
      <PageSection title="GPV Metrikleri" description="İlgili ay genel bakış">
        <GPVMetricsPanel data={data} />
      </PageSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection title="Live Dağılımı">
          <LiveDistributionChart data={data} />
        </PageSection>
        <PageSection title="Önceki Platformlar">
          <PreviousPlatformChart data={data.previousPlatforms} />
        </PageSection>
      </div>
    </div>
  )
}
