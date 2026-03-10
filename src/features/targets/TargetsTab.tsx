import { TargetBrandsList } from './TargetBrandsList'
import { PageSection } from '@/components/layout/PageSection'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TargetsTab() {
  const periodData = useDashboardPeriodData()

  if (!periodData) return null
  const nextMonthTargets = periodData.targets

  return (
    <div className="space-y-6">
      <PageSection
        title="Bir Sonraki Ay İçin Live Hedef Markalar"
        description="Planlanan marka, sektör ve tahmini ciro"
      >
        <TargetBrandsList data={nextMonthTargets} />
      </PageSection>
    </div>
  )
}
