import { useState } from 'react'
import { RepresentativeSuccessBoard } from './RepresentativeSuccessBoard'
import { RepresentativeMonthlyNpsChart } from './RepresentativeMonthlyNpsChart'
import { RepresentativeDetailView } from './RepresentativeDetailView'
import { RepCompareTab } from '@/features/representative-compare/RepCompareTab'
import { PageSection } from '@/components/layout/PageSection'
import { getMonthName } from '@/utils/date-utils'
import { useFilters } from '@/hooks/use-filters'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TeamPerformanceTab() {
  const { month, year } = useFilters()
  const periodData = useDashboardPeriodData()
  const [selectedRepName, setSelectedRepName] = useState<string | null>(null)
  if (!periodData) return null
  const autoRealizedCount = periodData.targets.filter((target) => target.status === 'live').length
  const trackedRealizedCount = periodData.realizedCount ?? autoRealizedCount

  if (selectedRepName) {
    return (
      <RepresentativeDetailView
        name={selectedRepName}
        year={year}
        month={month}
        onBack={() => setSelectedRepName(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageSection title="Temsilci Başarı Endeksi" description="Aylık temsilci skorları ve canlıya alma süresi trendi — bir temsilciye tıklayarak detaylarını incele">
        <div className="space-y-5">
          <RepresentativeSuccessBoard
            data={periodData.representativeSuccess}
            weights={periodData.representativeWeights}
            month={month}
            monthLabel={getMonthName(month)}
            trackedRealizedCount={trackedRealizedCount}
            trackedTargetCount={periodData.targetCount}
            year={year}
            onSelectRep={setSelectedRepName}
          />
          <RepresentativeMonthlyNpsChart year={year} month={month} />
        </div>
      </PageSection>

      <PageSection
        id="rep-compare-section"
        title="Temsilci Karşılaştırma"
        description="İki temsilciyi seçilen dönem aralığında karşılaştır"
      >
        <RepCompareTab />
      </PageSection>
    </div>
  )
}
