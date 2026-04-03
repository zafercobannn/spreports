import { RepresentativeSuccessBoard } from './RepresentativeSuccessBoard'
import { RepresentativeMonthlyNpsChart } from './RepresentativeMonthlyNpsChart'
import { PageSection } from '@/components/layout/PageSection'
import { getMonthName } from '@/utils/date-utils'
import { useFilters } from '@/hooks/use-filters'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TeamPerformanceTab() {
  const { month, year } = useFilters()
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const autoRealizedCount = periodData.targets.filter((target) => target.status === 'live').length
  const trackedRealizedCount = periodData.realizedCount ?? autoRealizedCount

  return (
    <div className="space-y-6">
      <PageSection title="Temsilci Başarı Endeksi" description="Aylık temsilci skorları ve canlıya alma süresi trendi">
        <div className="space-y-5">
          <RepresentativeSuccessBoard
            data={periodData.representativeSuccess}
            weights={periodData.representativeWeights}
            month={month}
            monthLabel={getMonthName(month)}
            trackedRealizedCount={trackedRealizedCount}
            trackedTargetCount={periodData.targetCount}
            year={year}
          />
          <RepresentativeMonthlyNpsChart year={year} month={month} />
        </div>
      </PageSection>
    </div>
  )
}
