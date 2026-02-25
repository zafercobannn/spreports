import { CohortHeatmap } from './CohortHeatmap'
import { CohortTopFirms } from './CohortTopFirms'
import { PageSection } from '@/components/layout/PageSection'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function CohortTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.cohort

  return (
    <div className="space-y-6">
      <PageSection title="Cohort Analizi">
        <CohortHeatmap data={data} />
      </PageSection>

      <PageSection title="Top 3 Firmalar" description="Her cohort için en yüksek GPV'li firmalar">
        <CohortTopFirms rows={data.rows} />
      </PageSection>
    </div>
  )
}
