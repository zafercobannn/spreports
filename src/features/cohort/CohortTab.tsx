import { CohortHeatmap } from './CohortHeatmap'
import { CohortTopFirms } from './CohortTopFirms'
import { PageSection } from '@/components/layout/PageSection'
import { useCohortForPeriod } from '@/hooks/use-dashboard-data'
import { useFilters } from '@/hooks/use-filters'

export function CohortTab() {
  const { year, month } = useFilters()
  const data = useCohortForPeriod(year, month)

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
