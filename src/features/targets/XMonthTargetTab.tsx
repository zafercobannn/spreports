import { useEffect, useMemo } from 'react'
import { PageSection } from '@/components/layout/PageSection'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getMonthName } from '@/utils/date-utils'
import { TargetBrandsList } from './TargetBrandsList'

function getOffsetPeriod(year: number, month: number, offset: number): { year: number; month: number } {
  let nextYear = year
  let nextMonth = month + offset

  while (nextMonth < 1) {
    nextMonth += 12
    nextYear -= 1
  }

  while (nextMonth > 12) {
    nextMonth -= 12
    nextYear += 1
  }

  return { year: nextYear, month: nextMonth }
}

export function XMonthTargetTab() {
  const { year, month } = useFilters()
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const targetPeriod = useMemo(() => getOffsetPeriod(year, month, 1), [year, month])
  const targetKey = useMemo(
    () => getPeriodKey(targetPeriod.year, targetPeriod.month),
    [targetPeriod.month, targetPeriod.year],
  )
  const targetPeriodData = useDashboardDataStore((s) => s.periods[targetKey])

  useEffect(() => {
    ensurePeriod(targetPeriod.year, targetPeriod.month)
  }, [ensurePeriod, targetPeriod.month, targetPeriod.year])

  return (
    <div className="space-y-6">
      <PageSection
        title="Bir Sonraki Ay Hedef"
        description={`${getMonthName(targetPeriod.month)} ${targetPeriod.year} için canlıya alınması hedeflenen markalar`}
      >
        <TargetBrandsList data={targetPeriodData?.targets ?? []} showStatus={false} />
      </PageSection>
    </div>
  )
}
