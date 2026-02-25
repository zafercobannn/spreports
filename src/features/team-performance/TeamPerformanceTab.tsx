import { SuccessIndexCard } from './SuccessIndexCard'
import { MonthlyTargetTable } from './MonthlyTargetTable'
import { SPComparisonChart } from './SPComparisonChart'
import { RepresentativeSuccessBoard } from './RepresentativeSuccessBoard'
import { PageSection } from '@/components/layout/PageSection'
import { getMonthName } from '@/utils/date-utils'
import { useFilters } from '@/hooks/use-filters'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TeamPerformanceTab() {
  const { month, year } = useFilters()
  const periodData = useDashboardPeriodData()
  if (!periodData) return null

  return (
    <div className="space-y-6">
      <PageSection title="Temsilci Başarı Endeksi" description="Aylık temsilci başarı skorları">
        <RepresentativeSuccessBoard
          data={periodData.representativeSuccess}
          weights={periodData.representativeWeights}
          monthLabel={getMonthName(month)}
          year={year}
        />
      </PageSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SuccessIndexCard data={periodData.successIndex} />
        <div className="lg:col-span-2">
          <MonthlyTargetTable
            data={periodData.monthlyTargets}
            monthLabel={getMonthName(month)}
          />
        </div>
      </div>

      <PageSection title="SP Karşılaştırması" description="Takım üyelerinin performansı">
        <SPComparisonChart data={periodData.teamPerformance} />
      </PageSection>
    </div>
  )
}
