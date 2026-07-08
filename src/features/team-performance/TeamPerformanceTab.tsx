import { useState } from 'react'
import { TeamLeaderboardSection } from './TeamLeaderboardSection'
import { RepresentativeMonthlyNpsChart } from './RepresentativeMonthlyNpsChart'
import { RepresentativeDetailView } from './RepresentativeDetailView'
import { RepCompareTab } from '@/features/representative-compare/RepCompareTab'
import { PageSection } from '@/components/layout/PageSection'
import { useFilters } from '@/hooks/use-filters'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TeamPerformanceTab() {
  const { month, year } = useFilters()
  const periodData = useDashboardPeriodData()
  const [selectedRepName, setSelectedRepName] = useState<string | null>(null)
  if (!periodData) return null

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
      <PageSection title="Temsilci Başarı Endeksi" description="Aylık/çeyreklik/yıllık temsilci skorları — bir temsilciye tıklayarak detaylarını incele">
        <div className="space-y-5">
          <TeamLeaderboardSection
            month={month}
            year={year}
            monthlyPeriodData={periodData}
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
